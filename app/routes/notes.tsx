import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/db/db";
import { notes as notesSchema } from "~/db/schema";

export async function loader() {
  const notes = await db.select().from(notesSchema);
  return json({ notes });
}

export default function Notes() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div>
      <div>Notes</div>
      {loaderData.notes.map((note) => (
        <div key={note.id}>{note.content}</div>
      ))}
    </div>
  );
}
