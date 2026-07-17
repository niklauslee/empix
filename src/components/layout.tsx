import { useEffect, useRef } from "react";

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  appbar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  onContentResize?: (width: number, height: number) => void;
}

export function Layout({
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
    <main className="absolute inset-0 bg-black text-white" {...others}>
      <header className="fixed inset-x-0 border-t border-b top-0 h-16">
        {appbar}
      </header>
      <section className="fixed top-16 bottom-0 left-0 right-0">
        <aside className="z-10 absolute inset-y-0 left-0 w-48 border-r transition-transform ease-linear duration-200">
          {leftSidebar}
        </aside>
        <aside className="z-10 absolute inset-y-0 right-0 w-48 border-l transition-transform ease-linear duration-200">
          {rightSidebar}
        </aside>
        <article
          ref={ref}
          className="absolute inset-y-0 left-48 right-48 transition-transform ease-linear duration-200"
        >
          {children}
        </article>
      </section>
    </main>
  );
}
