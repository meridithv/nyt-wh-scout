import Image from "next/image";

export default function Background() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      <Image
        src="/bg-writers-house.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
