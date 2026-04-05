"use client";

import styles from "./Receipt.module.css";
import Barcode from "react-barcode";
import { useRef } from "react";
import { toPng } from "html-to-image";

export default function Receipt({ data }: any) {
  const ref = useRef<HTMLDivElement>(null);

  const download = async () => {
    if (!ref.current) return;
    const url = await toPng(ref.current);
    const link = document.createElement("a");
    link.download = "receipt.png";
    link.href = url;
    link.click();
  };

  const total = data.expenses.reduce((a: number, b: any) => a + b.price, 0);

  return (
    <>
      <div ref={ref} className={styles.wrapper}>
        {/* 첫 번째 영수증 */}
        <div className={styles.receipt}>
          <h1 className={styles.title}>포커스 & 영탁</h1>

          <div className={styles.character}>🏃‍♂️⏰</div>

          <img src={data.image} className={styles.image} />

          <div className={styles.section}>
            <div className={styles.label}>한줄평</div>
            <p>{data.comment}</p>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>오늘 일정</div>
            {data.schedule.map((v: string, i: number) => (
              <p key={i}>
                {i + 1}. {v}
              </p>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.label}>오늘 한 일</div>
            {data.completed.map((v: string, i: number) => (
              <p key={i}>
                {i + 1}. {v}
              </p>
            ))}
          </div>
        </div>

        {/* 두 번째 영수증 */}
        <div className={styles.receipt}>
          <div className={styles.section}>
            <div className={styles.label}>끝내지 못한 일</div>
            {data.incomplete.map((v: string, i: number) => (
              <p key={i}>
                {i + 1}. {v}
              </p>
            ))}
          </div>

          <div className={styles.section}>
            <div className={styles.label}>오늘의 지출</div>
            {data.expenses.map((v: any, i: number) => (
              <p key={i}>
                {i + 1}. {v.title}
                <span className={styles.price}>{v.price.toLocaleString()}</span>
              </p>
            ))}
          </div>

          <div className={styles.total}>TOTAL {total.toLocaleString()}</div>

          <div className={styles.barcode}>
            <Barcode
              value={data.barcode}
              width={2}
              height={80}
              displayValue={false}
            />
          </div>
        </div>

        {/* 중앙 왁스 (간인) */}
        <div className={styles.wax}>❀</div>
      </div>

      <button onClick={download} className={styles.btn}>
        이미지 다운로드
      </button>
    </>
  );
}
