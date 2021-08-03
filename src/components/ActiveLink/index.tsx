import { useRouter } from "next/router";
import Link, { LinkProps } from "next/link";
import { cloneElement, ReactElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassNAme: string;
}
export function ActiveLink({
  children,
  activeClassNAme,
  ...rest
}: ActiveLinkProps) {
  const { asPath } = useRouter();
  const className = asPath === rest.href ? activeClassNAme : ''
  return <Link {...rest}>{cloneElement(children, { className })}</Link>
}
