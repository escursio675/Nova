export interface NoteTag {
  label: string;
}

export interface Note {
  id: string;
  title: string;
  path: string;
  tags: NoteTag[];
  body: string; // raw markdown content
}