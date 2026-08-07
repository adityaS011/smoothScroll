export function AnnouncementBar() {
  return (
    <div className="w-full bg-black/60 backdrop-blur">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-[11px] font-medium tracking-wider text-white/80 uppercase">
        <span>Future of Human Performance. Live now.</span>
        <a href="#" className="underline underline-offset-2 hover:text-white">
          Learn more
        </a>
      </p>
    </div>
  );
}
