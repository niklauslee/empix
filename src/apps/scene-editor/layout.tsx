import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  appbar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  onContentResize?: (width: number, height: number) => void;
}

export function Layout({
  className,
  appbar,
  leftSidebar,
  rightSidebar,
  onContentResize,
  children,
  ...others
}: LayoutProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.contentRect;
        const { width, height } = rect;
        if (onContentResize) onContentResize(width, height);
      }
    });
    ref.current && observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className={cn(
        "absolute inset-0 bg-background text-foreground",
        className,
      )}
      {...others}
    >
      <header className="fixed inset-x-0 top-0 h-12">{appbar}</header>
      <section className="fixed top-12 bottom-0 left-0 right-0">
        <aside className="z-10 absolute inset-y-0 left-0 w-48">
          {leftSidebar}
        </aside>
        <aside className="z-10 absolute inset-y-0 right-0 w-48">
          {rightSidebar}
        </aside>
        <article ref={ref} className="absolute inset-y-0 left-48 right-48">
          {children}
        </article>
      </section>
    </main>
  );
}
