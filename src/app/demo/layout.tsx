export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentionally omit meaningful language for the inaccessible demo.
  // Root layout sets lang="ka"; this wrapper documents the demo intent.
  return <div data-demo-missing-lang="true">{children}</div>;
}
