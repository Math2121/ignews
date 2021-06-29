import { SignInButton } from "../SignInButton";
import styles from "./style.module.scss";
import Link from "next/link";
import { ActiveLink } from "../ActiveLink";
export function Header() {

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />

        <nav>
          <ActiveLink href="/" activeClassNAme={styles.active}>
            <a className={styles.active}>
              Home
            </a>
          </ActiveLink>
          <ActiveLink href="/posts" activeClassNAme={styles.active}>
            <a >Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}
