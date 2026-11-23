"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";

type Modality = {
  id: string;
  name: string;
  active: boolean;
  teacher_commission_percent: number;
  image_url: string | null;
};

const input =
  "w-full rounded-lg border border-white/10 bg-[#0d0d11] px-3 py-3 text-sm text-white outline-none focus:border-[#FFD200]";

export default function ModalitiesPage() {
  const db = useMemo(() => createClient(), []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [rows, setRows] = useState<Modality[]>([]);
  const [name, setName] = useState("");
  const [commission, setCommission] = useState("50");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await db
      .from("modalities")
      .select("id,name,active,teacher_commission_percent,image_url")
      .order("name");

    if (loadError) {
      setError(loadError.message);
    } else {
      setRows(data ?? []);
      setError("");
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  function reset() {
    setEditing(null);
    setName("");
    setCommission("50");
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setClearImage(false);
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const payload = {
      name: name.trim(),
      teacher_commission_percent: Number(commission),
    };

    let modalityId = editing;
    let result: { error: { message: string } | null };

    if (editing) {
      result = await db
        .from("modalities")
        .update({
          ...payload,
          ...(clearImage ? { image_url: null } : {}),
        })
        .eq("id", editing);
    } else {
      const { data, error: insertError } = await db
        .from("modalities")
        .insert({ ...payload, active: true })
        .select("id")
        .single();

      result = { error: insertError };
      modalityId = data?.id ?? null;
    }

    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }

    if (imageFile && modalityId) {
      const extension =
        imageFile.type === "image/png"
          ? "png"
          : imageFile.type === "image/webp"
            ? "webp"
            : "jpg";
      const path = `${modalityId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await db.storage
        .from("modality-images")
        .upload(path, imageFile, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(
          "Modalidade salva, mas a foto não foi enviada: " +
            uploadError.message,
        );
        setBusy(false);
        await load();
        return;
      }

      const { data } = db.storage
        .from("modality-images")
        .getPublicUrl(path);

      const { error: urlError } = await db
        .from("modalities")
        .update({ image_url: data.publicUrl })
        .eq("id", modalityId);

      if (urlError) {
        setError(
          "Foto enviada, mas não foi possível vinculá-la: " +
            urlError.message,
        );
        setBusy(false);
        await load();
        return;
      }
    }

    setNotice(editing ? "Modalidade atualizada." : "Modalidade cadastrada.");
    reset();
    await load();
    setBusy(false);
  }

  async function toggle(row: Modality) {
    setError("");
    setNotice("");

    const { error: toggleError } = await db
      .from("modalities")
      .update({ active: !row.active })
      .eq("id", row.id);

    if (toggleError) {
      setError(toggleError.message);
    } else {
      setNotice(
        row.active ? "Modalidade desativada." : "Modalidade reativada.",
      );
      await load();
    }
  }

  function edit(row: Modality) {
    setEditing(row.id);
    setName(row.name);
    setCommission(String(row.teacher_commission_percent ?? 50));
    setImageUrl(row.image_url);
    setImagePreview(row.image_url);
    setImageFile(null);
    setClearImage(false);
    setNotice("");
    setError("");
  }

  function selectImage(file: File | null, inputElement: HTMLInputElement) {
    if (
      file &&
      (file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    ) {
      setError("Escolha uma imagem JPG, PNG ou WebP de até 5 MB.");
      inputElement.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setClearImage(false);
    setImagePreview(file ? URL.createObjectURL(file) : imageUrl);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setClearImage(true);
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="min-w-0 flex-1">
          <header className="border-b border-white/10 bg-[#0d0d11] px-5 py-5">
            <p className="text-sm text-neutral-400">
              Administração / Estrutura
            </p>
            <h1 className="text-xl font-semibold">Modalidades</h1>
          </header>

          <div className="mx-auto max-w-[1000px] space-y-6 p-5 md:p-8">
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-[#FFD200]">
                Catálogo esportivo
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Modalidades oferecidas
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Cadastre aqui apenas as modalidades. Turmas, professores e
                horários são administrados na área Turmas.
              </p>
            </div>

            {notice && (
              <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                {notice}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <form
              onSubmit={save}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#15151b] p-5"
            >
              <h3 className="font-semibold">
                {editing ? "Editar modalidade" : "Nova modalidade"}
              </h3>

              <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                <label className="text-xs text-neutral-400">
                  Nome
                  <input
                    className={input + " mt-2"}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Muay Thai"
                    required
                    maxLength={80}
                  />
                </label>

                <label className="text-xs text-neutral-400">
                  Comissão do professor (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commission}
                    onChange={(event) => setCommission(event.target.value)}
                    className={input + " mt-2"}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-400">
                    Foto da modalidade (JPG, PNG ou WebP · até 5 MB)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="mt-2 block w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#FFD200] file:px-3 file:py-2 file:font-bold file:text-black"
                      onChange={(event) =>
                        selectImage(
                          event.currentTarget.files?.[0] ?? null,
                          event.currentTarget,
                        )
                      }
                    />
                  </label>

                  {imagePreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Prévia da modalidade"
                        className="h-24 w-40 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-xs text-red-300"
                      >
                        Remover foto
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={
                      busy ||
                      Number(commission) < 0 ||
                      Number(commission) > 100
                    }
                    className="rounded-lg bg-[#FFD200] px-5 py-3 text-sm font-bold text-black disabled:opacity-50"
                  >
                    {busy
                      ? "Salvando..."
                      : editing
                        ? "Salvar modalidade"
                        : "Cadastrar modalidade"}
                  </button>

                  {editing && (
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-lg border border-white/10 px-4 py-3 text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </form>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#15151b]">
              <div className="border-b border-white/10 p-5">
                <h3 className="font-semibold">Modalidades cadastradas</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {rows.length} modalidade(s)
                </p>
              </div>

              {loading ? (
                <p className="p-6 text-sm text-neutral-400">Carregando...</p>
              ) : rows.length === 0 ? (
                <p className="p-6 text-sm text-neutral-400">
                  Nenhuma modalidade cadastrada.
                </p>
              ) : (
                <div className="divide-y divide-white/10">
                  {rows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4"
                    >
                      <div className="flex items-center gap-3">
                        {row.image_url ? (
                          <img
                            src={row.image_url}
                            alt={`Imagem de ${row.name}`}
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-white/5 text-neutral-500">
                            Foto
                          </div>
                        )}

                        <div>
                          <p className="font-medium">{row.name}</p>
                          <p
                            className={
                              row.active
                                ? "text-xs text-emerald-300"
                                : "text-xs text-neutral-500"
                            }
                          >
                            {row.active ? "Ativa" : "Inativa"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => edit(row)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggle(row)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs"
                        >
                          {row.active ? "Desativar" : "Reativar"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
