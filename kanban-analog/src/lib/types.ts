import type { Board, List, Card, Comment, Tag } from '../../drizzle/schema';

export type BoardSummary = Pick<Board, 'id' | 'title' | 'description'>;

export type BoardDetails = BoardSummary & {
  lists: Array<
    Pick<List, 'id' | 'title' | 'position'> & {
      cards: Array<
        Pick<
          Card,
          | 'id'
          | 'title'
          | 'description'
          | 'position'
          | 'completed'
          | 'assigneeId'
        > & {
          tags: Array<Pick<Tag, 'id' | 'name' | 'color'>>;
          comments: Array<
            Pick<Comment, 'id' | 'userId' | 'text' | 'createdAt'>
          >;
        }
      >;
    }
  >;
};

export type BoardList = BoardDetails['lists'][number];
export type BoardCard = BoardList['cards'][number];
export type UsersList = Array<{ id: string; name: string }>;
export type TagsList = Array<Pick<Tag, 'id' | 'name' | 'color'>>;
