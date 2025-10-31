export function draggableListUpdate(evt) {
  evt.preventDefault();
  evt.currentTarget.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'bg-primary/5', 'scale-[1.02]');
  const cardId = evt.dataTransfer.getData('cardId');
  const sourceListId = evt.dataTransfer.getData('listId');
  const targetListId = '%s';

  // Calculate drop position
  const dropY = evt.clientY;
  const cardsInList = evt.currentTarget.querySelectorAll('[data-card-id]');
  let insertPosition = cardsInList.length;

  for (let i = 0; i < cardsInList.length; i++) {
    const rect = cardsInList[i].getBoundingClientRect();
    const cardMiddle = rect.top + rect.height / 2;
    if (dropY < cardMiddle) {
      insertPosition = i;
      break;
    }
  }

  // Update card list if changed
  if (sourceListId !== targetListId) {
    fetch('/board/%s/card/' + cardId + '/list', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'listId=' + targetListId
    });
  }

  // Collect all card IDs in new order
  const allCardIds = Array.from(cardsInList)
    .filter(card => card.dataset.cardId !== cardId)
    .map(card => card.dataset.cardId);
  allCardIds.splice(insertPosition, 0, cardId);

  // Update positions
  const params = new URLSearchParams();
  allCardIds.forEach(id => params.append('cardIds', id));
  fetch('/board/%s/list/%s/positions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })
}
