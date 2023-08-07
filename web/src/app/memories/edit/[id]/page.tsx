"use client";

import { api } from "@/lib/api";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import React, { FormEvent, useEffect, useState } from "react";
import { parseCookies } from "nookies";
import Image from "next/image";
import Link from "next/link";
import { Camera, ChevronLeft } from "lucide-react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";
import { MediaPicker } from "@/components/MediaPicker";

interface Memory {
  coverUrl: string;
  content: string;
  createdAt: string;
  isPublic: boolean;
}

dayjs.locale(ptBR);

export default function Memory() {
  const [memory, setMemory] = useState<Memory | null>(null);
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { token } = parseCookies();

      const path = window.location.pathname;
      const id = path.split("/memories/edit/")[1];

      const response = await api.get(`/memories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMemory(response.data);
    };

    fetchData();
  }, []);

  async function handleEditMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fileToUpload = formData.get("coverUrl");

    let coverUrl = "";

    if (!!fileToUpload?.size) {
      const uploadFormData = new FormData();
      uploadFormData.set("file", fileToUpload);

      const uploadResponse = await api.post("/upload", uploadFormData);

      coverUrl = uploadResponse.data.fileUrl;
    }

    if (!coverUrl) {
      coverUrl = memory?.coverUrl || "";
    }

    const token = Cookie.get("token");

    const path = window.location.pathname;
    const id = path.split("/memories/edit/")[1];

    await api.put(
      `/memories/edit/${id}`,
      {
        coverUrl: coverUrl,
        content: formData.get("content"),
        isPublic: formData.get("isPublic"),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    router.push("/");
  }

  return (
    <div className="flex h-screen flex-col">
      <form onSubmit={handleEditMemory} className="flex flex-1 flex-col gap-2">
        <div className="flex flex-grow flex-col gap-10 p-8">
          <time className="-ml-8 flex items-center gap-2 before:h-px before:w-5 before:bg-gray-50">
            {dayjs(memory?.createdAt).format("D[ de ]MMMM[, ]YYYY")}
          </time>
          <div className="flex flex-1 flex-col">
            <div className="flex justify-between text-sm text-gray-100">
              <label
                htmlFor="isPublic"
                className="flex items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
              >
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  className="h-4 w-4 rounded border-gray-400 bg-gray-700 text-purple-500"
                />
                Tornar memória pública
              </label>

              <label
                htmlFor="media"
                className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-200 hover:text-gray-100"
              >
                <Camera className="h-4 w-4" />
                Editar Imagem
              </label>
            </div>

            <div onClick={() => setSelectedImage(true)}>
              <MediaPicker />
            </div>
            {!selectedImage && (
              <Image
                src={memory?.coverUrl || ""}
                width={592}
                height={280}
                className="aspect-video w-full rounded-lg object-cover"
                alt=""
              />
            )}
            <div className="py-5">
              <textarea
                name="content"
                spellCheck={false}
                className="flex w-full flex-grow rounded border-0 bg-transparent p-0 text-lg leading-relaxed text-gray-100 placeholder:text-gray-400 focus:ring-0"
                defaultValue={memory?.content}
                rows="25"
              />
            </div>
          </div>
        </div>

        <div className="mt-auto p-8">
          <div className="flex items-end justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-gray-200 hover:text-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar à timeline
            </Link>
            <button
              type="submit"
              className="rounded-full bg-green-500 px-5 py-3 font-alt text-sm font-bold uppercase leading-none text-black hover:bg-green-600"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
