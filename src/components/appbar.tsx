import { Button, buttonVariants } from "@/components/ui/button";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

/** Which editor is currently open — its nav button is rendered as active. */
export type AppbarApp = "screen" | "font";

const APPS: { app: AppbarApp; label: string; href: string }[] = [
  { app: "screen", label: "Screen", href: "/screen" },
  { app: "font", label: "Font", href: "/font" },
];

interface AppbarProps extends React.HTMLAttributes<HTMLDivElement> {
  active: AppbarApp;
  /** App-specific actions, right-aligned. */
  children?: React.ReactNode;
}

/**
 * The titlebar shared by both editors: logo, the Screen/Font nav, and a slot
 * for app-specific actions.
 */
export function Appbar({ active, className, children, ...others }: AppbarProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-full shrink-0 items-center justify-between border-b-[1.5px] border-neutral-700",
        className,
      )}
      {...others}
    >
      <div className="flex items-center justify-start gap-6 px-4">
        <div className="text-xl flex flex-row items-start justify-center gap-1">
          <Logo size={1.5} className="text-green-600" />
          <div className="text-xl ml-3">studio</div>
        </div>
        <div className="flex flex-row items-start justify-center gap-2">
          {APPS.map(({ app, label, href }) =>
            app === active ? (
              <Button key={app} variant="default">
                {label}
              </Button>
            ) : (
              <a
                key={app}
                href={href}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {label}
              </a>
            ),
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-4">
        {children}
        <a
          href="https://github.com/niklauslee/empix"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
      </div>
    </div>
  );
}
