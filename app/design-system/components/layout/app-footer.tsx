import { GiSpermWhale } from "react-icons/gi";

export function AppFooter() {
  return (
    <footer className="bg-primary-panel text-primary-text border-primary-border font-bold p-4 w-full h-14 flex justify-center items-center border-t ">
      <div className="flex justify-center items-center gap-2 text-xl font-bold">
        <GiSpermWhale aria-hidden="true" />
        <span>وال</span>
      </div>
    </footer>
  );
}
