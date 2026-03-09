import { describe, expect, it, vi } from "vitest";
import { countOwners, findAuthUserByEmail, listAllAuthUsers } from "@/lib/admin-ops";

describe("admin ops helpers", () => {
  it("lists auth users across pages until the final partial page", async () => {
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "1",
              email: "one@example.com",
              last_sign_in_at: "2026-03-09T10:00:00.000Z",
              user_metadata: { full_name: "One" },
            },
            {
              id: "2",
              email: "two@example.com",
              last_sign_in_at: null,
              user_metadata: { name: "Two" },
            },
          ],
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "3",
              email: "three@example.com",
              last_sign_in_at: null,
              user_metadata: {},
            },
          ],
        },
        error: null,
      });

    const client = {
      auth: {
        admin: {
          listUsers,
        },
      },
    } as never;

    const users = await listAllAuthUsers(client, { perPage: 2, maxPages: 5 });

    expect(users).toHaveLength(3);
    expect(users[0]).toMatchObject({
      id: "1",
      displayName: "One",
    });
    expect(users[1]).toMatchObject({
      id: "2",
      displayName: "Two",
    });
  });

  it("finds auth users by normalized email", async () => {
    const client = {
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [
                {
                  id: "alpha",
                  email: "user@example.com",
                  last_sign_in_at: null,
                  user_metadata: {},
                },
              ],
            },
            error: null,
          }),
        },
      },
    } as never;

    const user = await findAuthUserByEmail(client, " USER@EXAMPLE.COM ");

    expect(user?.id).toBe("alpha");
  });

  it("returns the owner count from ops_admin_profiles", async () => {
    const eq = vi.fn().mockResolvedValue({ count: 2, error: null });
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const client = {
      from,
    } as never;

    const count = await countOwners(client);

    expect(count).toBe(2);
    expect(from).toHaveBeenCalledWith("ops_admin_profiles");
  });
});
