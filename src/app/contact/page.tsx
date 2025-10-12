import Link from "next/link";

export default function ContactPage() {

    return (
      <section className="card">
        <h1 className="h1">Contact</h1>
        <p className="p">Ունե՞ս հարցեր կամ ուզում ես ընդլայնել նախագծը։ Գրի՝ hello@chupaboo.dev</p>
        <Link href="/">Վերադառնալ Home</Link>
      </section>
    );
  }
  