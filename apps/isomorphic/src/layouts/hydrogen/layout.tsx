import Image from "next/image";
import Header from "./header";

export default function HydrogenLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-grow">
      <div className="fixed w-full h-full z-0">
        <Image
          src="/bg.webp"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col w-full z-10">
        <Header />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9">
          {children}
        </div>
      </div>
    </main>
  );
}
