"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT } from "@/lib/site";

type Props = ImageProps & {
  showLoader?: boolean;
  containerClassName?: string;
};

type Status = "loading" | "loaded" | "error";

const LOADER_LOGO_SIZE_PX = 48;

function sourceKey(src: ImageProps["src"]): string {
  if (typeof src === "string") return src;

  return "default" in src ? src.default.src : src.src;
}

/**
 * Une nouvelle source crée une nouvelle instance de chargement.
 * Aucun état "loaded" hérité de l'image précédente (via `key` sur LoadingImage).
 */
export function ImageWithLoader({ showLoader = true, containerClassName, ...imageProps }: Props) {
  // Mode sans overlay : comportement next/image habituel, sans conteneur supplémentaire.
  if (!showLoader) {
    // `alt` est un champ obligatoire de `ImageProps` (imposé par TypeScript) et transite bien
    // par ce spread ; jsx-a11y/alt-text ne sait pas suivre un spread, d'où ce faux positif.
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...imageProps} />;
  }

  return (
    <LoadingImage
      key={sourceKey(imageProps.src)}
      {...imageProps}
      containerClassName={containerClassName}
    />
  );
}

function LoadingImage({
  containerClassName,
  className,
  onLoad,
  onError,
  ...imageProps
}: ImageProps & { containerClassName?: string }) {
  const t = useTranslations("Common.image");
  const imageRef = useRef<HTMLImageElement>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = imageRef.current;

    setEnhanced(true);

    // Vérification complémentaire pour une image déjà en cache navigateur
    // (le navigateur peut ne pas redéclencher onLoad de façon fiable pour
    // une image déjà "complete" au moment où React attache le handler).
    if (image?.complete && image.naturalWidth > 0) {
      void image.decode().then(
        () => {
          if (!cancelled) setStatus("loaded");
        },
        () => {
          // Une annulation de decode n'est pas forcément une erreur réseau :
          // laisser onLoad/onError décider dans ce cas.
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const pending = enhanced && status === "loading";

  return (
    <div
      className={cn(
        "relative isolate",
        imageProps.fill ? "h-full w-full" : "inline-block align-top",
        containerClassName,
      )}
      aria-busy={pending || undefined}
    >
      {/* Même faux positif jsx-a11y/alt-text qu'en tête de fichier : `alt` transite par le spread. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        {...imageProps}
        ref={imageRef}
        className={className}
        onLoad={(event) => {
          setStatus("loaded");
          onLoad?.(event);
        }}
        onError={(event) => {
          setStatus("error");
          onError?.(event);
        }}
      />

      <div
        aria-hidden="true"
        data-visible={pending}
        className="mh-image-loader pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-surface-2"
      >
        {pending && (
          <span className="mh-image-loader-mark">
            {/* Toujours next/image directement ici : pas de récursion sur ImageWithLoader. */}
            <Image
              src={LOGO_URL}
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              sizes={`${LOADER_LOGO_SIZE_PX}px`}
              className="h-12 w-12 object-contain"
            />
          </span>
        )}
      </div>

      {status === "error" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-2 p-4 text-center">
          <p className="text-sm text-text-secondary">{t("unavailable")}</p>
        </div>
      )}
    </div>
  );
}
