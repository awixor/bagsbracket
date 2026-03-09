import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Token",
  description:
    "Submit your Bags.fm token to compete in the next BagsBracket elimination tournament. First 8 approved tokens fill the bracket.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
