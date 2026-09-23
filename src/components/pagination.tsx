import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ButtonVariants } from "@/components/ui/button";
import { Cn } from "@/lib/utils";

export function Pagination({
  path,
  offset,
  pageSize,
  total,
  query,
}: {
  path: string;
  offset: number;
  pageSize: number;
  total: number;
  query?: Record<string, string>;
}) {
  const previousOffset = Math.max(0, offset - pageSize);
  const nextOffset = offset + pageSize;
  const page = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      {offset > 0 ? (
        <Link
          href={BuildPageUrl(path, previousOffset, query)}
          className={Cn(ButtonVariants({ variant: "outline", size: "sm" }), "px-3")}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-xs tabular-nums text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {nextOffset < total ? (
        <Link
          href={BuildPageUrl(path, nextOffset, query)}
          className={Cn(ButtonVariants({ variant: "outline", size: "sm" }), "px-3")}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function BuildPageUrl(path: string, offset: number, query?: Record<string, string>): string {
  const parameters = new URLSearchParams(query);
  parameters.set("offset", String(offset));
  return `${path}?${parameters.toString()}`;
}
