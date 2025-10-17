import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { BoardSummary, BoardDetails, UsersList, TagsList } from './types';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // Boards
  getBoards(): Observable<BoardSummary[]> {
    return this.http.get<BoardSummary[]>(`${this.baseUrl}/boards`);
  }

  getBoard(id: string): Observable<BoardDetails> {
    return this.http.get<BoardDetails>(`${this.baseUrl}/boards/${id}`);
  }

  createBoard(data: { title: string; description: string | null }): Observable<{
    success: boolean;
    data: { id: string; title: string; description: string | null };
  }> {
    return this.http.post<any>(`${this.baseUrl}/boards`, data);
  }

  // Users
  getUsers(): Observable<UsersList> {
    return this.http.get<UsersList>(`${this.baseUrl}/users`);
  }

  // Tags
  getTags(): Observable<TagsList> {
    return this.http.get<TagsList>(`${this.baseUrl}/tags`);
  }

  // Cards
  createCard(data: {
    boardId: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }): Observable<{ success: boolean; data: { id: string } }> {
    return this.http.post<any>(`${this.baseUrl}/cards`, data);
  }

  updateCard(data: {
    cardId: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    tagIds: string[];
  }): Observable<{ success: boolean }> {
    return this.http.patch<any>(`${this.baseUrl}/cards/${data.cardId}`, data);
  }

  deleteCard(cardId: string): Observable<{ success: boolean; error?: string }> {
    return this.http.delete<any>(`${this.baseUrl}/cards/${cardId}`);
  }

  moveCard(cardId: string, data: { newListId: string; newPosition?: number }): Observable<{ success: boolean }> {
    return this.http.post<any>(`${this.baseUrl}/cards/${cardId}/move`, data);
  }

  reorderCards(listId: string, cardIds: string[]): Observable<{ success: boolean }> {
    // Use first card ID for the endpoint, send all cardIds in body
    const firstCardId = cardIds[0] || 'placeholder';
    return this.http.post<any>(`${this.baseUrl}/cards/${firstCardId}/reorder`, { cardIds });
  }

  // Comments
  addComment(cardId: string, data: { userId: string; text: string }): Observable<{ success: boolean; data: { id: string } }> {
    return this.http.post<any>(`${this.baseUrl}/cards/${cardId}/comments`, data);
  }
}
