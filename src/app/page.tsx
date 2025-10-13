import Image from "next/image";
import Icon from "../../public/icon.svg"
import Link from "next/link";
export default function HomePage() {
  return (
    <section className="card">
      <div className="title">
      COMING SOON
      </div>
      <div className="text">
        <span>TASTY</span>
        <div className="round"/>
        <span>FUNNY</span>
        <div className="round"/>
        <span>PET FRIENDLY</span>
      </div>
      <Link className="icon" href='https://www.instagram.com/chupabooo/?next=%2F' target="_blunk">
        <Image src={Icon} alt=""/>
      </Link>
    </section>
  );
}