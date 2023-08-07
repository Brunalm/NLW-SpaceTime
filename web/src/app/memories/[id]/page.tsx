"use client";

import { api } from "@/lib/api";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import React, { useEffect, useState } from "react";
import { parseCookies } from "nookies";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";

interface Memory {
  id: string;
  coverUrl: string;
  content: string;
  createdAt: string;
}

dayjs.locale(ptBR);

export default function Memory() {
  const [memory, setMemory] = useState<Memory | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { token } = parseCookies();

      const path = window.location.pathname;
      const id = path.split("/memories/")[1];

      const response = await api.get(`/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMemory(response.data);
    };

    fetchData();
  }, []);

  return (
    <>
        <div className="flex flex-col gap-10 p-8">
          <div className="space-y-4">
            <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
              {dayjs(memory?.createdAt).format("D[ de ]MMMM[, ]YYYY")}
            </time>

            <Image
              src={memory?.coverUrl || ""}
              width={592}
              height={280}
              className="aspect-video w-full rounded-lg object-cover"
              alt=""
            />

            <p className="text-lg leading-relaxed text-gray-100">
              {memory?.content}
            </p>
          </div>
        </div>

      <div className="flex flex-grow items-end justify-between p-12">
        <div>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-200 hover:text-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar à timeline
          </Link>
        </div>

        <div className="ml-auto flex items-center">
        <Pencil className="h-4 w-4 pr-1" />
          <Link
            href={`/memories/edit/${memory?.id}`}
            className="flex items-center gap-1 text-sm text-gray-200 hover:text-gray-100"
          >
            Editar memória
          </Link>
        </div>
      </div>
    </>
  );
}
