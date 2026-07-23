import type { Metadata } from "next";
import { ServiceDetail } from "@/components/ServiceDetail";
import { servicosDetalhe } from "@/lib/content";

const data = servicosDetalhe.palestras;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: `/servicos/${data.slug}` },
};

export default function Page() {
  return <ServiceDetail data={data} />;
}
