import Image from "next/image";
import Header from "./header";

export default function HydrogenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen flex-grow overflow-x-hidden">
      <div className="fixed w-full h-full" style={{ zIndex: -1 }}>
        <Image
          src="/bg.webp"
          alt="Background"
          fill
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full min-w-0">
        <Header />
        <div className="flex flex-grow flex-col px-4 pb-6 pt-2 md:px-5 lg:px-6 lg:pb-8 3xl:px-8 3xl:pt-4 4xl:px-10 4xl:pb-9 min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}
