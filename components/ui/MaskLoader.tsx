import Image from "next/image";
import styles from "./MaskLoader.module.css";

/** A visual loading state with a translated, screen-reader-accessible label. */
export function MaskLoader({ label, size = "section", className = "" }: {
  label: string;
  size?: "page" | "section";
  className?: string;
}) {
  return <div role="status" aria-live="polite" className={`${styles.loader} ${styles[size]} ${className}`}>
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.ring} />
      <Image src="/images/loading-mask.webp" alt="" width={126} height={150} unoptimized className={styles.mask} />
    </div>
    <span className="sr-only">{label}</span>
  </div>;
}
