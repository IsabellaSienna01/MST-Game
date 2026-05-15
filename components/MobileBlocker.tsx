export default function MobileBlocker({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex h-screen items-center justify-center bg-black p-6 text-center text-white md:hidden">
        <div className="max-w-sm">
          <h1 className="text-2xl font-bold">
            Desktop Required
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            This application is optimized for desktop use.
            Please open it on a larger screen or desktop browser.
          </p>
        </div>
      </div>

      <div className="hidden h-screen md:block">
        {children}
      </div>
    </>
  );
}