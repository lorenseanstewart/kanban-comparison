#!/usr/bin/env python3

"""
Bundle Size Chart Generator

Generates an attractive SVG bar chart from bundle size data.
Reads from metrics/bundle-summary.json and creates an SVG bar chart.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any


def load_bundle_data(metrics_dir: Path) -> Dict[str, Any]:
    """Load bundle size data from JSON file."""
    bundle_file = metrics_dir / 'bundle-summary.json'
    if not bundle_file.exists():
        raise FileNotFoundError(f"Bundle data not found at {bundle_file}")

    with open(bundle_file, 'r') as f:
        return json.load(f)


def create_bar_chart_svg(data: List[Dict[str, Any]], output_path: Path) -> None:
    """
    Create an attractive SVG bar chart for bundle sizes.

    Args:
        data: List of framework data with 'framework' and 'jsTransferred' keys
        output_path: Path where SVG will be saved
    """
    # Sort data by bundle size (ascending)
    sorted_data = sorted(data, key=lambda x: x['jsTransferred'])

    # Update framework names
    for item in sorted_data:
        if item['framework'] == 'Astro':
            item['framework'] = 'Astro/HTMX'

    # Chart dimensions
    width = 800
    height = 500
    margin_top = 60
    margin_bottom = 80
    margin_left = 100
    margin_right = 50
    chart_width = width - margin_left - margin_right
    chart_height = height - margin_top - margin_bottom

    # Calculate bar dimensions
    num_bars = len(sorted_data)
    bar_width = chart_width / num_bars * 0.8
    bar_spacing = chart_width / num_bars

    # Find max value for scaling
    max_value = max(item['jsTransferred'] for item in sorted_data)
    max_kb = max_value / 1024

    # Create nice round y-axis max
    y_max = ((max_kb // 50) + 1) * 50 if max_kb < 200 else ((max_kb // 100) + 1) * 100

    # Color palette (modern, accessible colors)
    colors = [
        '#3b82f6',  # blue
        '#8b5cf6',  # purple
        '#ec4899',  # pink
        '#f59e0b',  # amber
        '#10b981',  # green
        '#06b6d4',  # cyan
        '#6366f1',  # indigo
        '#84cc16',  # lime
        '#f97316',  # orange
    ]

    # Start building SVG
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" font-family="system-ui, -apple-system, sans-serif">',
        f'  <!-- Background -->',
        f'  <rect width="{width}" height="{height}" fill="#ffffff"/>',
        f'',
        f'  <!-- Title -->',
        f'  <text x="{width/2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">',
        f'    JavaScript Bundle Size (Gzipped)',
        f'  </text>',
        f'  <text x="{width/2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">',
        f'    Smaller is better',
        f'  </text>',
        f'',
        f'  <!-- Chart area -->',
        f'  <g transform="translate({margin_left}, {margin_top})">',
        f'',
    ]

    # Add Y-axis grid lines and labels
    num_ticks = 5
    for i in range(num_ticks + 1):
        y_value = (y_max / num_ticks) * i
        y_pos = chart_height - (y_value / y_max * chart_height)

        # Grid line
        svg_parts.append(f'    <line x1="0" y1="{y_pos:.1f}" x2="{chart_width}" y2="{y_pos:.1f}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>')

        # Y-axis label
        svg_parts.append(f'    <text x="-10" y="{y_pos:.1f}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">{int(y_value)} kB</text>')

    svg_parts.append('')

    # Add bars and labels
    for i, item in enumerate(sorted_data):
        kb_value = item['jsTransferred'] / 1024
        bar_height = (kb_value / y_max) * chart_height
        x_pos = i * bar_spacing + (bar_spacing - bar_width) / 2
        y_pos = chart_height - bar_height
        color = colors[i % len(colors)]

        # Bar with gradient
        gradient_id = f"grad{i}"
        svg_parts.append(f'    <defs>')
        svg_parts.append(f'      <linearGradient id="{gradient_id}" x1="0%" y1="0%" x2="0%" y2="100%">')
        svg_parts.append(f'        <stop offset="0%" style="stop-color:{color};stop-opacity:0.9" />')
        svg_parts.append(f'        <stop offset="100%" style="stop-color:{color};stop-opacity:0.7" />')
        svg_parts.append(f'      </linearGradient>')
        svg_parts.append(f'    </defs>')

        # Bar rectangle with rounded top
        svg_parts.append(f'    <rect x="{x_pos:.1f}" y="{y_pos:.1f}" width="{bar_width:.1f}" height="{bar_height:.1f}" fill="url(#{gradient_id})" rx="4"/>')

        # Value label on top of bar
        svg_parts.append(f'    <text x="{x_pos + bar_width/2:.1f}" y="{y_pos - 8:.1f}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2937">{kb_value:.1f}</text>')

        # Framework name (rotated for better fit)
        label_x = x_pos + bar_width / 2
        label_y = chart_height + 15
        svg_parts.append(f'    <text x="{label_x:.1f}" y="{label_y:.1f}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, {label_x:.1f}, {label_y:.1f})">{item["framework"]}</text>')

    # Close chart group and add axis lines
    svg_parts.extend([
        '',
        f'    <!-- X-axis -->',
        f'    <line x1="0" y1="{chart_height}" x2="{chart_width}" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        f'',
        f'    <!-- Y-axis -->',
        f'    <line x1="0" y1="0" x2="0" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        f'',
        f'  </g>',
        f'',
        f'  <!-- Footer note -->',
        f'  <text x="{width/2}" y="{height - 10}" text-anchor="middle" font-size="10" fill="#9ca3af">',
        f'    Generated from Lighthouse network measurements • {len(sorted_data)} frameworks compared',
        f'  </text>',
        f'</svg>',
    ])

    # Write SVG file
    svg_content = '\n'.join(svg_parts)
    with open(output_path, 'w') as f:
        f.write(svg_content)


def create_comparison_chart(home_data: List[Dict], board_data: List[Dict], output_path: Path) -> None:
    """
    Create a comparison chart showing home vs board page bundle sizes.

    Args:
        home_data: Home page bundle data
        board_data: Board page bundle data
        output_path: Path where SVG will be saved
    """
    # Update framework names
    for item in home_data:
        if item['framework'] == 'Astro':
            item['framework'] = 'Astro/HTMX'
    for item in board_data:
        if item['framework'] == 'Astro':
            item['framework'] = 'Astro/HTMX'

    # Merge data by framework
    frameworks = {}
    for item in home_data:
        frameworks[item['framework']] = {'home': item['jsTransferred'] / 1024}
    for item in board_data:
        if item['framework'] in frameworks:
            frameworks[item['framework']]['board'] = item['jsTransferred'] / 1024

    # Sort by home page size
    sorted_frameworks = sorted(frameworks.items(), key=lambda x: x[1]['home'])

    # Chart dimensions
    width = 900
    height = 500
    margin_top = 60
    margin_bottom = 80
    margin_left = 100
    margin_right = 120
    chart_width = width - margin_left - margin_right
    chart_height = height - margin_top - margin_bottom

    # Calculate bar dimensions
    num_groups = len(sorted_frameworks)
    group_width = chart_width / num_groups
    bar_width = group_width * 0.35

    # Find max value
    max_value = max(max(data['home'], data.get('board', 0)) for _, data in sorted_frameworks)
    y_max = ((max_value // 50) + 1) * 50 if max_value < 200 else ((max_value // 100) + 1) * 100

    # Colors
    color_home = '#3b82f6'
    color_board = '#16a34a'

    # Start SVG
    svg_parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" font-family="system-ui, -apple-system, sans-serif">',
        f'  <rect width="{width}" height="{height}" fill="#ffffff"/>',
        f'',
        f'  <text x="{width/2}" y="30" text-anchor="middle" font-size="20" font-weight="600" fill="#1f2937">',
        f'    Bundle Size Comparison: Home vs Board Page',
        f'  </text>',
        f'  <text x="{width/2}" y="48" text-anchor="middle" font-size="12" fill="#6b7280">',
        f'    JavaScript transferred (gzipped, in kB)',
        f'  </text>',
        f'',
        f'  <g transform="translate({margin_left}, {margin_top})">',
    ]

    # Grid lines and Y-axis
    num_ticks = 5
    for i in range(num_ticks + 1):
        y_value = (y_max / num_ticks) * i
        y_pos = chart_height - (y_value / y_max * chart_height)
        svg_parts.append(f'    <line x1="0" y1="{y_pos:.1f}" x2="{chart_width}" y2="{y_pos:.1f}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>')
        svg_parts.append(f'    <text x="-10" y="{y_pos:.1f}" text-anchor="end" dominant-baseline="middle" font-size="11" fill="#6b7280">{int(y_value)} kB</text>')

    # Add grouped bars
    for i, (framework, data) in enumerate(sorted_frameworks):
        x_center = i * group_width + group_width / 2

        # Home page bar
        home_value = data['home']
        home_height = (home_value / y_max) * chart_height
        home_x = x_center - bar_width - 2
        home_y = chart_height - home_height

        svg_parts.append(f'    <rect x="{home_x:.1f}" y="{home_y:.1f}" width="{bar_width:.1f}" height="{home_height:.1f}" fill="{color_home}" rx="3"/>')
        svg_parts.append(f'    <text x="{home_x + bar_width/2:.1f}" y="{home_y - 5:.1f}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">{home_value:.1f}</text>')

        # Board page bar
        if 'board' in data:
            board_value = data['board']
            board_height = (board_value / y_max) * chart_height
            board_x = x_center + 2
            board_y = chart_height - board_height

            svg_parts.append(f'    <rect x="{board_x:.1f}" y="{board_y:.1f}" width="{bar_width:.1f}" height="{board_height:.1f}" fill="{color_board}" rx="3"/>')
            svg_parts.append(f'    <text x="{board_x + bar_width/2:.1f}" y="{board_y - 5:.1f}" text-anchor="middle" font-size="10" font-weight="600" fill="#1f2937">{board_value:.1f}</text>')

        # Framework label
        label_x = x_center
        label_y = chart_height + 15
        svg_parts.append(f'    <text x="{label_x:.1f}" y="{label_y:.1f}" text-anchor="end" font-size="11" fill="#374151" transform="rotate(-45, {label_x:.1f}, {label_y:.1f})">{framework}</text>')

    # Axes
    svg_parts.extend([
        f'    <line x1="0" y1="{chart_height}" x2="{chart_width}" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        f'    <line x1="0" y1="0" x2="0" y2="{chart_height}" stroke="#1f2937" stroke-width="2"/>',
        f'  </g>',
        f'',
    ])

    # Legend
    legend_x = width - margin_right + 10
    legend_y = margin_top + 20
    svg_parts.extend([
        f'  <g transform="translate({legend_x}, {legend_y})">',
        f'    <rect x="0" y="0" width="15" height="15" fill="{color_home}" rx="2"/>',
        f'    <text x="20" y="12" font-size="12" fill="#374151">Home Page</text>',
        f'    <rect x="0" y="25" width="15" height="15" fill="{color_board}" rx="2"/>',
        f'    <text x="20" y="37" font-size="12" fill="#374151">Board Page</text>',
        f'  </g>',
        f'',
    ])

    svg_parts.append('</svg>')

    # Write file
    with open(output_path, 'w') as f:
        f.write('\n'.join(svg_parts))


def main():
    """Main execution function."""
    print("📊 Generating bundle size charts...")

    # Setup paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    metrics_dir = project_root / 'metrics'

    if not metrics_dir.exists():
        print(f"❌ Metrics directory not found at {metrics_dir}")
        print("   Run 'npm run measure:bundles' first to generate data.")
        return 1

    try:
        # Load data
        data = load_bundle_data(metrics_dir)

        home_data = data.get('homePage', [])
        board_data = data.get('boardPage', [])

        if not home_data:
            print("❌ No home page data found in bundle-summary.json")
            return 1

        # Generate home page chart
        home_chart_path = metrics_dir / 'bundle-size-home.svg'
        create_bar_chart_svg(home_data, home_chart_path)
        print(f"✅ Home page chart: {home_chart_path}")

        # Generate board page chart
        if board_data:
            board_chart_path = metrics_dir / 'bundle-size-board.svg'
            create_bar_chart_svg(board_data, board_chart_path)
            print(f"✅ Board page chart: {board_chart_path}")

        # Generate comparison chart
        if home_data and board_data:
            comparison_chart_path = metrics_dir / 'bundle-size-comparison.svg'
            create_comparison_chart(home_data, board_data, comparison_chart_path)
            print(f"✅ Comparison chart: {comparison_chart_path}")

        print("\n📈 Charts generated successfully!")
        print(f"   Location: {metrics_dir}")
        print("\n💡 Use these SVG files in your blog post. They're scalable and look great!")

        return 0

    except Exception as e:
        print(f"❌ Error generating charts: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    exit(main())
