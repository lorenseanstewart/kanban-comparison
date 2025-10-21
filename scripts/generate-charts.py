#!/usr/bin/env python3
"""
Generate SVG charts from measurement data.

Reads metrics/final-measurements.json and generates:
- bundle-size-board.svg (board page bundle sizes)
- bundle-size-home.svg (home page bundle sizes)
- bundle-size-comparison.svg (combined comparison)
"""

import json
import sys
from pathlib import Path


# Framework colors (matching existing charts)
COLORS = [
    "#3b82f6",  # blue
    "#8b5cf6",  # purple
    "#ec4899",  # pink
    "#f59e0b",  # amber
    "#10b981",  # green
    "#06b6d4",  # cyan
    "#6366f1",  # indigo
    "#84cc16",  # lime
    "#f97316",  # orange
    "#14b8a6",  # teal
]


def round_to_nice_number(value, round_up=True):
    """Round to a nice number for axis (20, 40, 50, 100, etc.)"""
    if value <= 0:
        return 20

    # Get magnitude
    magnitude = 10 ** (len(str(int(value))) - 1)

    # Nice intervals based on magnitude
    if magnitude >= 100:
        interval = 50
    elif magnitude >= 50:
        interval = 20
    else:
        interval = 10

    if round_up:
        return ((value // interval) + 1) * interval
    else:
        return (value // interval) * interval


def create_vertical_bar_chart(data, title, subtitle, output_file, page_type, show_compressed=False):
    """Create a vertical bar chart SVG matching the existing style."""

    # Filter and sort data by raw size (smallest first)
    page_data = [d for d in data if d['page'] == page_type]
    page_data.sort(key=lambda x: x['jsUncompressed']['median'])

    if not page_data:
        print(f"No data found for page type: {page_type}")
        return

    # Chart dimensions
    width = 800
    height = 500
    margin_left = 100
    margin_top = 60
    margin_bottom = 80
    chart_width = 650
    chart_height = 360

    # Determine max value and y-axis scale (use raw size)
    max_raw_value = max(d['jsUncompressed']['median'] / 1024 for d in page_data)
    y_max = round_to_nice_number(max_raw_value, round_up=True)
    y_interval = round_to_nice_number(y_max / 5, round_up=False)

    # Calculate bar width and spacing
    num_bars = len(page_data)
    bar_spacing = chart_width / num_bars
    bar_width = bar_spacing * 0.8
    bar_gap = bar_spacing * 0.1

    # Start SVG
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" font-family="system-ui, -apple-system, sans-serif">',
        '  <!-- Background -->',
        f'  <rect width="{width}" height="{height}" fill="#ffffff"/>',
        '',
        '  <!-- Title -->',
        f'  <text x="{width/2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">',
        f'    {title}',
        '  </text>',
        f'  <text x="{width/2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">',
        f'    {subtitle}',
        '  </text>',
        '',
        '  <!-- Chart area -->',
        f'  <g transform="translate({margin_left}, {margin_top})">',
        '',
    ]

    # Y-axis gridlines and labels
    for i in range(6):  # 0 to y_max in 5 intervals
        y_value = i * y_interval
        y_pos = chart_height - (y_value / y_max * chart_height)

        svg_lines.extend([
            f'    <line x1="0" y1="{y_pos}" x2="{chart_width}" y2="{y_pos}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>',
            f'    <text x="-10" y="{y_pos}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">{int(y_value)} kB</text>',
        ])

    svg_lines.append('')

    # Bars
    for i, item in enumerate(page_data):
        x_pos = bar_gap + (i * bar_spacing)
        x_center = x_pos + (bar_width / 2)

        # Calculate bar heights
        raw_kb = item['jsUncompressed']['median'] / 1024
        compressed_kb = item['jsTransferred']['median'] / 1024

        raw_height = (raw_kb / y_max) * chart_height
        raw_y = chart_height - raw_height

        color = COLORS[i % len(COLORS)]

        # Gradient definition
        svg_lines.extend([
            f'    <defs>',
            f'      <linearGradient id="grad{i}" x1="0%" y1="0%" x2="0%" y2="100%">',
            f'        <stop offset="0%" style="stop-color:{color};stop-opacity:0.9" />',
            f'        <stop offset="100%" style="stop-color:{color};stop-opacity:0.7" />',
            f'      </linearGradient>',
            f'    </defs>',
        ])

        # Bar
        svg_lines.append(f'    <rect x="{x_pos}" y="{raw_y}" width="{bar_width}" height="{raw_height}" fill="url(#grad{i})" rx="4"/>')

        # Value label above bar
        label_y = raw_y - 8
        if show_compressed:
            svg_lines.extend([
                f'    <text x="{x_center}" y="{label_y}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">{raw_kb:.1f}</text>',
                f'    <text x="{x_center}" y="{label_y + 12}" text-anchor="middle" font-size="9" fill="#6b7280">({compressed_kb:.1f})</text>',
            ])
        else:
            svg_lines.append(f'    <text x="{x_center}" y="{label_y}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">{raw_kb:.1f}</text>')

        # Framework label (rotated)
        label_text = item['framework'].replace(' ', '\xa0')  # Non-breaking spaces
        svg_lines.append(f'    <text x="{x_center}" y="{chart_height + 15}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, {x_center}, {chart_height + 15})">{label_text}</text>')

    # Axes
    svg_lines.extend([
        '',
        '    <!-- X-axis -->',
        f'    <line x1="0" y1="{chart_height}" x2="{chart_width}" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        '',
        '    <!-- Y-axis -->',
        f'    <line x1="0" y1="0" x2="0" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        '',
        '  </g>',
        '',
    ])

    # Footer
    num_frameworks = len(page_data)
    svg_lines.extend([
        '  <!-- Footer note -->',
        f'  <text x="{width/2}" y="{height - 10}" text-anchor="middle" font-size="10" fill="#9ca3af">',
        f'    Generated from Lighthouse measurements • {num_frameworks} frameworks compared',
        '  </text>',
        '</svg>',
    ])

    # Write file
    output_path = Path(__file__).parent.parent / 'metrics' / output_file
    output_path.write_text('\n'.join(svg_lines))
    print(f"Generated: {output_file}")


def create_comparison_chart(data, output_file):
    """Create a grouped bar chart showing board vs home page for each framework."""

    # Get frameworks sorted by board page size
    board_data = [d for d in data if d['page'] == 'board']
    board_data.sort(key=lambda x: x['jsUncompressed']['median'])

    # Chart dimensions
    width = 1200
    height = 500
    margin_left = 120
    margin_top = 100
    margin_bottom = 100
    chart_width = 1000
    chart_height = 320

    # Determine max value across both pages
    max_value = max(d['jsUncompressed']['median'] / 1024 for d in data)
    y_max = round_to_nice_number(max_value, round_up=True)
    y_interval = round_to_nice_number(y_max / 5, round_up=False)

    # Calculate bar dimensions
    num_frameworks = len(board_data)
    group_width = chart_width / num_frameworks
    bar_width = group_width * 0.25  # Two bars per group (reduced for skinnier bars)
    bar_gap = group_width * 0.05

    # Start SVG
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" font-family="system-ui, -apple-system, sans-serif">',
        '  <!-- Background -->',
        f'  <rect width="{width}" height="{height}" fill="#ffffff"/>',
        '',
        '  <!-- Title -->',
        f'  <text x="{width/2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">',
        '    Bundle Size Comparison: Board vs Home Page',
        '  </text>',
        f'  <text x="{width/2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">',
        '    Raw (uncompressed) JavaScript bundle sizes',
        '  </text>',
        '',
        '  <!-- Chart area -->',
        f'  <g transform="translate({margin_left}, {margin_top})">',
        '',
    ]

    # Y-axis gridlines
    for i in range(6):
        y_value = i * y_interval
        y_pos = chart_height - (y_value / y_max * chart_height)
        svg_lines.extend([
            f'    <line x1="0" y1="{y_pos}" x2="{chart_width}" y2="{y_pos}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>',
            f'    <text x="-10" y="{y_pos}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">{int(y_value)} kB</text>',
        ])

    svg_lines.append('')

    # Color scheme for comparison
    board_color = "#3b82f6"  # blue
    home_color = "#10b981"   # green

    # Bars
    for i, board_item in enumerate(board_data):
        framework = board_item['framework']
        # Rename Astro to Astro/HTMX for display
        display_name = 'Astro/HTMX' if framework == 'Astro' else framework
        home_item = next((d for d in data if d['page'] == 'home' and d['framework'] == framework), None)

        group_x = i * group_width
        x_center = group_x + (group_width / 2)

        # Board page bar
        board_kb = board_item['jsUncompressed']['median'] / 1024
        board_height = (board_kb / y_max) * chart_height
        board_y = chart_height - board_height
        board_x = group_x + bar_gap

        svg_lines.extend([
            f'    <rect x="{board_x}" y="{board_y}" width="{bar_width}" height="{board_height}" fill="{board_color}" opacity="0.8" rx="3"/>',
            f'    <text x="{board_x + bar_width/2}" y="{board_y - 5}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">{board_kb:.0f}</text>',
        ])

        # Home page bar (if exists)
        if home_item:
            home_kb = home_item['jsUncompressed']['median'] / 1024
            home_height = (home_kb / y_max) * chart_height
            home_y = chart_height - home_height
            home_x = board_x + bar_width + bar_gap

            svg_lines.extend([
                f'    <rect x="{home_x}" y="{home_y}" width="{bar_width}" height="{home_height}" fill="{home_color}" opacity="0.8" rx="3"/>',
                f'    <text x="{home_x + bar_width/2}" y="{home_y - 5}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">{home_kb:.0f}</text>',
            ])

        # Framework label
        label_text = display_name.replace(' ', '\xa0')
        svg_lines.append(f'    <text x="{x_center}" y="{chart_height + 15}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, {x_center}, {chart_height + 15})">{label_text}</text>')

    # Axes
    svg_lines.extend([
        '',
        '    <!-- X-axis -->',
        f'    <line x1="0" y1="{chart_height}" x2="{chart_width}" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        '',
        '    <!-- Y-axis -->',
        f'    <line x1="0" y1="0" x2="0" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        '',
        '  </g>',
        '',
    ])

    # Legend (moved under subtitle to reduce clutter)
    legend_y = 65
    svg_lines.extend([
        '  <!-- Legend -->',
        f'  <rect x="{width/2 - 100}" y="{legend_y}" width="20" height="15" fill="{board_color}" opacity="0.8" rx="2"/>',
        f'  <text x="{width/2 - 75}" y="{legend_y + 12}" font-size="11" fill="#374151">Board Page</text>',
        f'  <rect x="{width/2 + 20}" y="{legend_y}" width="20" height="15" fill="{home_color}" opacity="0.8" rx="2"/>',
        f'  <text x="{width/2 + 45}" y="{legend_y + 12}" font-size="11" fill="#374151">Home Page</text>',
    ])

    # Footer
    svg_lines.extend([
        '  <!-- Footer note -->',
        f'  <text x="{width/2}" y="{height - 10}" text-anchor="middle" font-size="10" fill="#9ca3af">',
        f'    Generated from Lighthouse measurements • {len(board_data)} frameworks compared',
        '  </text>',
        '</svg>',
    ])

    # Write file
    output_path = Path(__file__).parent.parent / 'metrics' / output_file
    output_path.write_text('\n'.join(svg_lines))
    print(f"Generated: {output_file}")


def main():
    # Read measurements
    data_file = Path(__file__).parent.parent / 'metrics' / 'final-measurements.json'

    if not data_file.exists():
        print(f"Error: {data_file} not found")
        print("Run 'npm run measure:all' first to generate measurement data")
        sys.exit(1)

    with open(data_file) as f:
        json_data = json.load(f)

    # Extract results array from JSON structure
    data = json_data.get('results', json_data)

    print(f"Loaded {len(data)} measurements")

    # Generate charts
    create_vertical_bar_chart(
        data,
        "JavaScript Bundle Size (Raw)",
        "Board page • Smaller is better",
        "bundle-size-board.svg",
        "board",
        show_compressed=False
    )

    create_vertical_bar_chart(
        data,
        "JavaScript Bundle Size (Raw)",
        "Home page • Smaller is better",
        "bundle-size-home.svg",
        "home",
        show_compressed=False
    )

    create_comparison_chart(data, "bundle-size-comparison.svg")

    print("\n✓ Charts generated successfully in metrics/")


if __name__ == '__main__':
    main()
