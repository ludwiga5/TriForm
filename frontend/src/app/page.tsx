import Image from "next/image";
import styles from "./page.module.css";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/globe.svg"
          alt="TriForm logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>Welcome to TriForm</h1>
          <p>
            Do you have an already have an account?
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Login
          </a>
          <a
            className={styles.secondary}
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sign Up
          </a>
        </div>
        <div className={styles.intro}>
          <h3>Want to follow the project?</h3>
          <div className={styles.ctas}>
            <a
            className={styles.secondary}
            href="https://github.com/ludwiga5/TriForm"
            target="_blank"
            rel="noopener noreferrer"
            >
            Check out my GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
