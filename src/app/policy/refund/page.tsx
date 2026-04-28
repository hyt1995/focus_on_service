import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 bg-white">
      <h1 className="text-2xl font-bold text-[#191F28] mb-8">
        환불 및 청약철회 정책
      </h1>

      <div className="space-y-8 text-[15px] text-[#4E5968] leading-relaxed">
        <section>
          <h2 className="text-[18px] font-bold text-[#191F28] mb-3">
            제1조 (목적)
          </h2>
          <p>
            본 약관은 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에
            의거하여, 타임다이브(이하 "회사")가 제공하는 유료 서비스(프리미엄
            멤버십, AI 브레인덤프 등)의 청약철회 및 환불에 관한 사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-[#191F28] mb-3">
            제2조 (청약철회 및 환불 규정)
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              회원(소비자)은 유료 서비스를 결제한 날로부터 7일 이내에
              청약철회(환불)를 요청할 수 있습니다.
            </li>
            <li>
              결제 후 7일 이내라도 서비스를 전혀 사용하지 않은 경우에 한하여
              전액 환불이 가능합니다.
            </li>
            <li>
              환불 요청이 접수되면 회사는 3영업일 이내에 결제 수단과 동일한
              방법으로 환불을 진행합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-[#191F28] mb-3">
            제3조 (청약철회가 제한되는 경우)
          </h2>
          <p className="mb-2">
            다음 각 호에 해당하는 경우 「전자상거래 등에서의 소비자보호에 관한
            법률」 제17조 제2항에 따라 청약철회 및 환불이 제한될 수 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-2 bg-[#F2F4F6] p-4 rounded-xl text-[#191F28] font-medium">
            <li>
              디지털 콘텐츠(AI 브레인덤프, 프리미엄 무제한 슬롯 등)의 제공이
              개시된 경우 (단, 가분적 용역으로 구성된 경우 제공이 개시되지 않은
              부분은 제외)
            </li>
            <li>결제 후 7일이 경과한 경우</li>
            <li>
              회원의 귀책사유로 인해 서비스 이용 내역이 발생하여 가치가 현저히
              감소한 경우
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-[#191F28] mb-3">
            제4조 (환불 신청 방법)
          </h2>
          <p>
            환불을 원하시는 회원은 아래 고객센터 이메일을 통해 환불 사유와 결제
            정보를 기재하여 접수해 주시기 바랍니다.
          </p>
          <div className="mt-2 text-[#3182F6] font-bold">
            고객센터 이메일: hanyt1995@gmail.com
          </div>
        </section>
      </div>
    </div>
  );
}
