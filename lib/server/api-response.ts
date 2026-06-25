import { NextResponse } from "next/server";

type Meta = {
  page?: number;
  pageSize?: number;
  total?: number;
};

export function ok<T>(data: T, meta?: Meta, init?: ResponseInit) {
  return NextResponse.json(meta ? { data, meta } : { data }, init);
}

export function fail(
  code: string,
  message: string,
  status = 400,
  details: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details
      }
    },
    { status }
  );
}
