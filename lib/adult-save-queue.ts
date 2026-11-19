import { z } from "zod";
import { adultDraftSchema } from "./adult-flow";

export const localAdultDraftSchema = z.object({
  parcoursId: z.string().nullable(),
  sessionId: z.string().nullable(),
  answers: adultDraftSchema,
  updatedAt: z.number(),
});

export const adultLocalKey = (userId: string) => `totem:adult-draft:${userId}`;

/** Serialize full snapshots. A failed save must not block later snapshots. */
export class AdultSaveQueue<T, R> {
  private tail: Promise<unknown> = Promise.resolve();
  private revision = 0;

  constructor(private readonly write: (snapshot: T) => Promise<R>,
    private readonly status: (state: "saving" | "saved" | "pending") => void) {}

  save(snapshot: T): Promise<R> {
    const revision = ++this.revision;
    this.status("saving");
    const operation = this.tail.catch(() => undefined).then(() => this.write(snapshot));
    this.tail = operation;
    void operation.then(() => {
      if (revision === this.revision) this.status("saved");
    }, () => {
      if (revision === this.revision) this.status("pending");
    });
    return operation;
  }
}
