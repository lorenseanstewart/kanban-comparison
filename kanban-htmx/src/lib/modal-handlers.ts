// Modal response handlers for HTMX forms

export function handleAddBoardResponse(event: any, form: HTMLFormElement) {
  const errorDiv = document.getElementById("add-board-error");
  if (!errorDiv) return;

  if (event.detail.successful) {
    const modal = document.getElementById(
      "add-board-modal"
    ) as HTMLDialogElement;
    modal?.close();
    form.reset();
    errorDiv.innerHTML = "";
  } else if (event.detail.xhr.status === 400) {
    errorDiv.innerHTML =
      '<div class="alert alert-error"><span>' +
      event.detail.xhr.responseText +
      "</span></div>";
  }
}

export function handleAddCardSuccess(event: any, form: HTMLFormElement) {
  const errorDiv = document.getElementById("add-card-error");
  if (!errorDiv) return;

  if (event.detail.successful) {
    const modal = document.getElementById(
      "add-card-modal"
    ) as HTMLDialogElement;
    modal?.close();
    form.reset();
    errorDiv.innerHTML = "";
    // Reset tag badges
    document.querySelectorAll(".tag-checkbox").forEach((cb) => {
      const input = cb as HTMLInputElement;
      input.checked = false;
      const tagId = input.dataset.tagId;
      const badge = document.querySelector(
        `[data-tag-badge="${tagId}"]`
      ) as HTMLElement;
      if (badge) {
        badge.classList.add("badge-outline");
        badge.classList.remove("text-white");
        badge.style.backgroundColor = "";
        const borderColor = getComputedStyle(badge).borderColor;
        badge.style.color = borderColor;
      }
    });
  } else if (event.detail.xhr.status === 400) {
    errorDiv.innerHTML =
      '<div class="alert alert-error"><span>' +
      event.detail.xhr.responseText +
      "</span></div>";
  }
}

export function handleEditCardSuccess(event: any) {
  const errorDiv = document.getElementById("edit-card-error");
  if (!errorDiv) return;

  if (event.detail.successful) {
    const modal = document.getElementById(
      "edit-card-modal"
    ) as HTMLDialogElement;
    modal?.close();
    errorDiv.innerHTML = "";
  } else if (event.detail.xhr.status === 400) {
    errorDiv.innerHTML =
      '<div class="alert alert-error"><span>' +
      event.detail.xhr.responseText +
      "</span></div>";
  }
}

export function handleCommentResponse(
  event: any,
  form: HTMLFormElement,
  cardId: string
) {
  const errorDiv = document.getElementById(`comment-error-${cardId}`);

  if (!errorDiv) {
    console.error("Error div not found for card:", cardId);
    return;
  }

  if (event.detail.successful) {
    const modal = document.getElementById(
      `comment-modal-${cardId}`
    ) as HTMLDialogElement;
    modal?.close();
    form.reset();
    errorDiv.innerHTML = "";
  } else if (event.detail.xhr?.status === 400) {
    errorDiv.innerHTML =
      '<div class="alert alert-error"><span>' +
      event.detail.xhr.responseText +
      "</span></div>";
  }
}

export function openEditCardModal(cardId: string) {
  // Use the latest board data from namespace
  const currentBoard = (window as any).kanban?.board;
  if (!currentBoard) return;

  // Find the card in the board data
  let card = null;
  for (const list of currentBoard.lists) {
    const found = list.cards.find((c: any) => c.id === cardId);
    if (found) {
      card = found;
      break;
    }
  }

  if (!card) return;

  // Set the hx-patch URL dynamically
  const form = document.getElementById("edit-card-form") as HTMLFormElement;
  if (form) {
    form.setAttribute(
      "hx-patch",
      `/api/card-update/${currentBoard.id}/${card.id}`
    );
  }

  // Set the hx-delete URL dynamically for delete button
  const deleteBtn = document.getElementById(
    "delete-card-btn"
  ) as HTMLButtonElement;
  if (deleteBtn) {
    deleteBtn.setAttribute(
      "hx-delete",
      `/api/card-delete/${currentBoard.id}/${card.id}`
    );
  }

  // Populate form
  const titleInput = document.getElementById(
    "edit-card-title"
  ) as HTMLInputElement;
  const descInput = document.getElementById(
    "edit-card-description"
  ) as HTMLTextAreaElement;
  const assigneeSelect = document.getElementById(
    "edit-card-assignee"
  ) as HTMLSelectElement;
  const cardIdInput = document.getElementById(
    "edit-card-id"
  ) as HTMLInputElement;

  if (cardIdInput) cardIdInput.value = card.id;
  if (titleInput) titleInput.value = card.title;
  if (descInput) descInput.value = card.description || "";
  if (assigneeSelect) assigneeSelect.value = card.assigneeId || "";

  // Reset and set tag checkboxes
  document.querySelectorAll(".edit-tag-checkbox").forEach((checkbox) => {
    const input = checkbox as HTMLInputElement;
    const tagId = input.dataset.editTagId;
    const isSelected = card.tags.some((t: any) => t.id === tagId);
    input.checked = isSelected;

    const badge = document.querySelector(
      `[data-edit-tag-badge="${tagId}"]`
    ) as HTMLElement;
    if (badge) {
      const originalColor = badge.dataset.originalColor;
      if (isSelected) {
        badge.classList.remove("badge-outline");
        badge.classList.add("text-white");
        badge.style.backgroundColor = originalColor;
        badge.style.color = "white";
      } else {
        badge.classList.add("badge-outline");
        badge.classList.remove("text-white");
        badge.style.backgroundColor = "";
        badge.style.color = originalColor;
      }
    }
  });

  // Reinitialize HTMX for the form and delete button
  if ((window as any).htmx) {
    (window as any).htmx.process(form);
    (window as any).htmx.process(deleteBtn);
  }

  // Clear any previous errors
  const errorDiv = document.getElementById("edit-card-error");
  if (errorDiv) errorDiv.innerHTML = "";

  // Open modal
  const modal = document.getElementById("edit-card-modal") as HTMLDialogElement;
  modal?.showModal();
}
