import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/db/db";
import { notes as notesTable } from "~/db/schema";
import { z } from "zod";
import {
  FieldConfig,
  conform,
  useFieldList,
  useFieldset,
  useForm,
} from "@conform-to/react";
import { useRef } from "react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { eq } from "drizzle-orm";

import { Input } from "../components/input";
import {
  Field,
  FieldGroup,
  Label,
  Fieldset,
  ErrorMessage,
} from "../components/fieldset";
import { Strong } from "../components/text";
import { Button } from "../components/button";

const noteSchema = z.object({
  id: z.number(),
  content: z.string(),
});

const notesSchema = z.object({
  notes: z.array(noteSchema),
});

export async function loader() {
  const notes = await db.select().from(notesTable);
  return json({ notes });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parse(formData, { schema: notesSchema });

  if (!submission.value) {
    return json({ status: "error", submission } as const, { status: 400 });
  }
  const { notes } = submission.value;

  notes.forEach(async (note) => {
    await db.update(notesTable).set(note).where(eq(notesTable.id, note.id));
  });

  return null;
}

export default function Notes() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    defaultValue: { notes: loaderData.notes },
    lastSubmission: actionData?.submission,
    constraint: getFieldsetConstraint(notesSchema),
  });
  const notesList = useFieldList(form.ref, fields.notes);

  return (
    <div className="flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Strong>Notes</Strong>
        <form method="post" {...form.props} className="space-y-8">
          <ul>
            {notesList.map((noteFieldConfig) => (
              <Note config={noteFieldConfig} key={noteFieldConfig.key} />
            ))}
          </ul>
          <Button type="submit">Save</Button>
        </form>
      </div>
    </div>
  );
}

function Note({ config }: { config: FieldConfig<z.infer<typeof noteSchema>> }) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const fields = useFieldset(ref, config);

  return (
    <li>
      <fieldset ref={ref} {...conform.fieldset(config)}>
        <Fieldset>
          <input {...conform.input(fields.id)} type="hidden" />
          <FieldGroup>
            <Field>
              <Label>Note {fields.id.defaultValue} Content</Label>
              <Input
                {...conform.input(fields.content)}
                invalid={fields.content.errors !== undefined}
              />
              <ErrorMessage>{fields.content.errors}</ErrorMessage>
            </Field>
          </FieldGroup>
        </Fieldset>
      </fieldset>
    </li>
  );
}
