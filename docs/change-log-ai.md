# AI change log

## 2026-06-24 / V3 paper-domain E2E smoke hardening

- Added stable paper-domain browser smoke `scripts/smoke/paper-domain-smoke.mjs` and `npm run smoke:papers`.
- Fixed smoke targeting to `sourceKey = toeic-sample-001`, with deterministic 3-item correct / wrong / unanswered verification.
- Added stable `data-testid` hooks across `/papers`, paper detail, take, edit readonly, and report pages.
- Added no-JS route fallbacks for starting attempts, saving responses, and submit redirect so the browser smoke remains stable under dev-server hydration issues.
- Adjusted attempt grading semantics so `wrongItems` means answered-but-wrong, while unanswered is derived as `totalItems - answeredItems`.
- Verified `npm run smoke:papers`: BASE_URL `http://127.0.0.1:3000`, attemptId `cmqsaecw3000bu8w4okhx6okd`, total/correct/wrong/unanswered `3/1/1/1`, autosave reload PASS, submit idempotency PASS, published read-only PASS.
# AI 鍙樻洿璁板綍

## 2026-06-24 / V3 paper-domain 棣栧寘

- 鏂板鏁村嵎绯荤粺 paper-domain 鏁版嵁妯″瀷锛歅aper銆丳aperVersion銆丳aperSection銆丵uestionItem銆丵uestionOption銆丄ttempt銆丄ttemptResponse銆丟radingResult锛屽苟棰勭暀 UploadedFile銆両mportJob銆丳arseJob銆?- 鏂板 paper-domain service 涓?API Routes锛岃鐩?Paper 鍒涘缓/鍒楄〃/璇︽儏銆佺増鏈垱寤?鍙戝竷銆乨raft-only 鍒嗗尯/棰樼洰/閫夐」缁存姢銆丄ttempt 鍒涘缓/淇濆瓨/鎻愪氦/鎶ュ憡銆?- 鏂板鏈€灏?UI 闂幆锛歚/papers`銆乣/papers/new`銆乣/papers/{paperId}`銆乣/paper-versions/{versionId}/edit`銆乣/paper-versions/{versionId}/take`銆乣/attempts/{attemptId}/report`銆?- 鏂板 `data/papers/toeic-sample-001.json` 鍜?`npm run seed:papers`锛岀敤浜庢湰鍦版牱渚嬭瘯鍗峰箓绛夊鍏ャ€?- 鏂板 paper-domain 鍗曞厓/API 娴嬭瘯锛涙棫鍗曢鐢熸垚銆佺瓟棰樸€侀敊棰樺拰缁熻閾捐矾鏈噸鍐欍€?- 楠岃瘉缁撴灉锛歚npm run typecheck`銆乣npm run test:run`銆乣npx prisma validate`銆乣npm run lint`銆乣npm run build` 鍧囬€氳繃锛沗npm run seed:papers` 棣栨瀵煎叆 PASS銆侀噸澶嶆墽琛?SKIP銆?
## 2026-06-24 / 鍚姩璺緞淇

- 纭褰撳墠宸ヤ綔鍖哄灞傜洰褰曚负 `E:\toelic`锛屽疄闄?Next.js 椤圭洰鏍圭洰褰曚负 `E:\toelic\toelic`锛涗粠澶栧眰鐩存帴鎵ц `npm run dev` 浼氬洜缂哄皯 `package.json` 鍚姩澶辫触銆?- 鍦ㄥ灞傛柊澧炶交閲?`package.json` 鍚姩杞彂鍏ュ彛锛屽皢 `dev`銆乣build`銆乣start`銆佸叕缃戝惎鍔ㄣ€侀毀閬撱€乴int銆乼ypecheck銆乼est 鍜?Prisma 鍛戒护杞彂鍒板唴灞傞」鐩€?- 鍦?`next.config.ts` 鏄庣‘ `turbopack.root`锛岄伩鍏嶅灞?`package-lock.json` 璁?Next.js 灏?workspace root 鎺ㄦ柇鍒伴敊璇眰绾с€?- 鏇存柊 `readme.md` 涓?`docs/project-context.md` 涓棫鐨?`D:\toelic` 鏍圭洰褰曡褰曚负褰撳墠瀹為檯璺緞銆?
## 2026-06-24 / 鐩綍缁撴瀯涓庢枃妗ｅ叆鍙ｆ暣鐞?
- 灏?spec-driven 鍥涗欢濂椾粠鏍圭洰褰曠Щ鍔ㄥ埌 `docs/spec-driven/`锛歚spec.md`銆乣design.md`銆乣tasks.md`銆乣acceptance.md`銆?
- 灏嗚緟鍔╄剼鏈寜鐢ㄩ€斿綊绫伙細`scripts/smoke/`銆乣scripts/public/`銆乣scripts/reports/`銆?
- 灏嗘墜宸ラ獙璇佹暟鎹簱绉诲姩鍒?`output/database/`锛屾牴鐩綍鍙繚鐣欐鏋堕厤缃€佹爣鍑?`README.md` 鍜屽繀瑕佹簮鐮佺洰褰曘€?
- 鏂板 `docs/README.md` 鏂囨。绱㈠紩锛屽苟閲嶅啓 `docs/project-context.md` 涓哄綋鍓?V2.1 鐘舵€併€?
- 鏇存柊 `package.json` 鑴氭湰銆丷EADME銆佹姤鍛婄敓鎴愯剼鏈拰褰撳墠鏂囨。涓殑鑴氭湰璺緞寮曠敤銆?
- 褰撳墠鏈€鏂伴獙璇佸彛寰勶細`npm run typecheck`銆乣npm run lint`銆乣npm run test:run`銆乣npm run build`銆乣npx prisma validate`銆乣npx prisma migrate deploy`銆?

## 2026-06-12 / TypeScript 鍗曞厓娴嬭瘯浣撶郴

- 鎸?TypeScript + Next.js 椤圭洰鐜扮姸鎺ュ叆 Vitest 鍗曞厓娴嬭瘯浣撶郴锛屾柊澧?`vitest.config.ts`銆乣tests/setup.ts` 鍜?`tests/unit/` 鐢ㄤ緥鐩綍锛涙祴璇曠幆澧冨浐瀹氫负 Node锛屼笉寮曞叆 JUnit銆乯sdom 鎴?React Testing Library銆?
- 鏂板寮€鍙戜緷璧?`vitest`銆乣@vitest/coverage-v8`銆乣vite-tsconfig-paths`锛屽苟琛ュ厖 `test`銆乣test:run`銆乣test:coverage` 鑴氭湰锛涜鐩栫巼鍙撼鍏ユ牳蹇冪敓棰樹笌绛旈閾捐矾鏂囦欢锛岄伩鍏嶆妸璁剧疆銆佺粺璁°€侀敊棰樺垪琛ㄧ瓑澶栧洿妯″潡绾冲叆棣栫増鍗曟祴鍙ｅ緞銆?
- 浠呬繚鐣欐渶鍏抽敭鍔熻兘娴嬭瘯锛歚question-generation`銆乣practice-service` 浠ュ強鐢熸垚棰?绛旈璁板綍 API Route 钖勫眰锛涘垹闄?`question-validation`銆佽缃€佺粺璁°€丮aaS 瀹㈡埛绔€侀敊棰樻湇鍔＄瓑杈冧笉閲嶈娴嬭瘯銆侾risma銆丮aaS銆丱penAI銆乫etch 鍧囦娇鐢?mock锛屼笉璁块棶鐪熷疄缃戠粶鎴栨暟鎹簱銆?
- 灏嗘瘡涓祴璇曟枃浠剁殑鍏叡鍑嗗閫昏緫鏁寸悊涓烘樉寮?`setUp()`锛屽啀閫氳繃 Vitest `beforeEach(setUp)` 璋冪敤锛涙柊澧?`tests/unit/test-utils.ts` 澶嶇敤 API 娴嬭瘯鐨?JSON 璇锋眰涓庡搷搴旇В鏋愶紝鏁翠綋缁撴瀯瀵瑰簲璇惧爞 xUnit/JUnit 鐨?`@Before` / `@After` 鎬濊矾銆?
- 楠岃瘉缁撴灉锛歂ode v24.14.0 婊¤冻 Vitest 鏈€鏂扮増瑕佹眰锛沗npm run test:run` 4 涓枃浠?/ 17 涓牳蹇冪敤渚嬪叏閮ㄩ€氳繃锛沗npm run test:coverage` 閫氳繃锛屾牳蹇冩枃浠?statements 瑕嗙洊鐜?91.46%锛沗npm run lint` 鏃犻敊璇絾淇濈暀鏃㈡湁 `output/presentation/src/build-report-deck.mjs` warning锛沗npm run build` 閫氳繃銆?

## 2026-05-15 / Markdown 鏂囨。澶嶅埗鎵撳寘褰掓。

- 灏嗛」鐩唴 `.md` / `.mdx` / `.markdown` / `.txt` 灞曠ず鍨嬫枃瀛楁枃浠跺鍒跺埌 `E:\BaiduNetdiskDownload\TOEIC缁冧範椤圭洰鏂囨。姹囨€籠files\`锛屾寜鏂囨。鍐呭涓庣敤閫旈噸鏂板懡鍚嶅苟鍒嗙被銆?
- 鐢熸垚 `E:\BaiduNetdiskDownload\TOEIC缁冧範椤圭洰鏂囨。姹囨€籠鏂囨。鎵撳寘姹囨€?md` 涓?`鏂囨。鏂囦欢娓呭崟.csv`锛岃褰曞師璺緞銆佸綊妗ｈ矾寰勩€佺被鍨嬨€佸ぇ灏忋€佽鏁板拰鍐呭鏍囬銆?
- 鐢熸垚鍘嬬缉鍖?`E:\BaiduNetdiskDownload\TOEIC缁冧範椤圭洰鏂囨。姹囨€?zip`锛涘幓闄ゅ璇濈嚎绋?ID 鍜屾椂闂存埑寮忔暟瀛楃粍鍚堟枃浠跺悕锛屾湰娆℃湭淇敼涓氬姟浠ｇ爜锛屾湭瀹夎渚濊禆銆?

## 2026-05-13 / Codex 瀵硅瘽璁板綍褰掓。

- 灏?3 涓寚瀹?Codex 浼氳瘽 `.jsonl` 鍘熷璁板綍澶嶅埗鍒?`docs/codex-conversations/raw/`锛屼繚鐣欏叏灞€ `.codex` 鍘熷浼氳瘽涓嶅垹闄わ紝閬垮厤鐮村潖 Codex 妗岄潰绔巻鍙茶褰曘€?
- 鏂板 `docs/codex-conversations/README.md`锛岃褰曠嚎绋?ID銆佷富棰樸€侀」鐩唴褰掓。璺緞銆佹枃浠跺ぇ灏忓拰 SHA256 鏍￠獙鍊笺€?
- 鏈鏈慨鏀逛笟鍔′唬鐮併€佹湭瀹夎渚濊禆銆佹湭杩愯鏋勫缓閾撅紱浠呭仛椤圭洰鍐呭璇濊瘉鎹綊妗ｃ€?

## 2026-05-13 / Codex 瀵硅瘽 Markdown 瀵煎嚭

- 鏂板 `scripts/reports/export-codex-conversations-md.py`锛屼粠 `docs/codex-conversations/raw/*.jsonl` 鎻愬彇鐢ㄦ埛璇㈤棶涓庡姪鎵嬪洖澶嶏紝瀵煎嚭涓?Markdown銆?
- 鏂板 `docs/codex-conversations/markdown/README.md` 鍜?3 涓嚎绋?Markdown 鏂囦欢锛屽垎鍒寘鍚?227銆?12銆?2 鏉?user/assistant 娑堟伅銆?
- 杞崲鏃跺埢鎰忚烦杩囧伐鍏疯皟鐢ㄥ拰缁堢杈撳嚭锛屼繚鐣欓棶绛旀鏂囷紝渚夸簬璇惧爞鏉愭枡鏁寸悊涓庝汉宸ラ槄璇汇€?

## 2026-05-10 / 寮€鍙戣繃绋嬫埅鍥?Word 姹囨€?

- 鏂板 `scripts/reports/build-dev-process-doc.py`锛岀敤浜庣敓鎴愬紑鍙戣繃绋嬫埅鍥捐鏄?Word銆?
- 鐢熸垚 `output/doc/toeic-dev-process-screenshots.docx`锛屼粎鏀跺綍寮€鍙戣繃绋嬫潗鏂欙紝涓嶅寘鍚鍫傚睍绀?PPT 椤甸潰鍐呭銆?
- Word 鍐呭瑕嗙洊澶фā鍨嬪璇濇棩蹇楁憳褰曘€乻pec-driven Gate 娴佺▼銆佽璁℃枃妗ｃ€乀01-T22 浠诲姟鎷嗗垎銆侀獙鏀惰褰曘€丄I 鍙樻洿鏃堕棿绾裤€佸伐绋嬬粨鏋勩€佺粓绔獙璇佹憳瑕併€佷骇鍝佽繍琛屼笌鍝嶅簲寮忔埅鍥俱€?
- 澶фā鍨嬪璇濇埅鍥炬潵婧愪负 Codex 鏈湴浼氳瘽鏃ュ織鎽樺綍锛屾湭浼€犺亰澶?UI 鎴浘锛涜嫢璇惧爞瑕佹眰鑱婂ぉ绐楀彛鍘熷浘锛屽彲鎸?Word 绗?1 鑺傛彁绀鸿ˉ鎷嶆浛鎹€?
- 楠岃瘉缁撴灉锛欴OCX 鍙 `python-docx` 鎵撳紑锛屽寘鍚?25 寮犲浘鐗囧拰 35 娈垫枃鏈紱褰撳墠鐜鏈娴嬪埌 LibreOffice / Poppler锛屾湭鎵ц DOCX 娓叉煋鎴愰€愰〉 PNG 鐨勮瑙夊鏍搞€?

## 2026-05-10 / 璇惧爞姹囨姤 PPT 杞熀琛ㄨ揪銆丟PT UML 涓庢灦鏋勫浘澧炲己

- 鎸夌敤鎴疯姹傚幓闄?PPT 涓€滆绋嬪榻?/ 绗嚑绔?/ 璧勬簮椤佃瘉鎹€濈瓑鏄惧紡瀵归綈璇濇湳锛屾敼涓哄湪姝ｆ枃涓嚜鐒朵綋鐜伴渶姹傚缓妯°€佽繃绋嬫帶鍒躲€佸璞℃娊璞°€佹帴鍙ｈ竟鐣屻€佹祴璇曢獙鏀跺拰宸ョ▼鍙嶆€濄€?
- 鍒犻櫎鍘熺 19 椤碘€滆鍫傜幇鍦烘紨绀鸿矾绾库€濓紝鏂扮増 PPT 鍥哄畾鐢熸垚 19 椤碉紱棰勮鐩綍浼氬厛娓呯悊鏃?`slide-*.png`锛岄伩鍏嶆畫鐣欐棫绗?20 椤点€?
- 鎵€鏈?UML 寤烘ā绱犳潗鍧囨敼涓?GPT 鐢熷浘缁撴灉锛屽苟澶嶅埗鍒?`output/presentation/assets/`锛氱敤渚嬪浘銆佹椿鍔ㄥ浘銆佺被鍥俱€佹椂搴忓浘锛涜剼鏈笉鍐嶈皟鐢ㄥ師鍏堢殑绋嬪簭鍖?UML 鐢熸垚浣滀负鏈€缁堢礌鏉愩€?
- 鎶€鏈灦鏋勯〉鏀逛负 GPT 鐢熸垚鐨勮创鍚堥」鐩疄闄呮灦鏋勫浘锛屽睍绀烘祻瑙堝櫒 UI銆丯ext.js API Route銆佷笟鍔℃湇鍔″眰銆丮aaS Client銆丮aaS 浜戞湇鍔°€丣SON 鏍￠獙銆丳risma ORM銆丼QLite 鏈湴鏁版嵁搴撲笌瀹夊叏杈圭晫銆?
- spec-driven 涓庢帹杩涜瘉鎹〉澧炲姞鐪熷疄鏂囨。鐗囨鎴浘绱犳潗锛岃鐩?`spec.md`銆乣design.md`銆乣tasks.md`銆乣acceptance.md`锛岀敤浜庤瘉鏄庡紑鍙戞祦绋嬪拰楠屾敹璇佹嵁閾俱€?
- 鎬荤粨鍙嶆€濋〉鏀逛负 6 涓淮搴﹀睍寮€锛氭柟娉曟敹鑾枫€佸缓妯℃敹鑾枫€佸伐绋嬫敹鑾枫€佷骇鍝佹敹鑾枫€佷笉瓒冲弽鎬濄€佸悗缁墿灞曘€?
- 閲嶆柊鐢熸垚 `output/presentation/toeic-practice-studio-final-report.pptx`銆?9 寮犻瑙堝浘銆乣contact-sheet.png`銆乣speaker-notes.md` 鍜?`manifest.json`锛涙湭淇敼涓氬姟浠ｇ爜鍜岄」鐩繍琛屼緷璧栥€?

## 2026-05-10 / 璇惧爞姹囨姤 PPT 璇剧▼璐村悎涓?UML 寤烘ā澧炲己

- 閫氳繃璇剧▼璧勬簮椤垫牳瀵广€婅蒋浠跺伐绋嬪熀纭€銆嬬炕杞鍫傝姹傦紝纭璇剧▼绔犺妭瑕嗙洊杞欢杩囩▼銆佽蒋浠堕渶姹傘€侀潰鍚戝璞″垎鏋愪笌璁捐銆佽蒋浠剁郴缁熻璁°€佽蒋浠剁紪鐮佷笌瀹炵幇銆佽蒋浠舵祴璇曘€?
- 淇濇寔 PPT 椤垫暟涓?20 椤典笉鍙橈紝澧炲己 `output/presentation/src/build-report-deck.mjs`锛屽皢璇剧▼瑕佹眰铻嶅叆灏侀潰銆佺洰褰曘€佸紑鍙戞柟娉曘€佺敤鎴锋祦绋嬨€佹暟鎹ā鍨嬨€丄I 鐢熸垚閾捐矾鍜岃绋垮娉ㄣ€?
- 鏂板骞跺祵鍏ヨ绋嬭创鍚堢礌鏉愶細璇剧▼璧勬簮椤垫埅鍥俱€乁ML 鐢ㄤ緥鍥俱€乁ML 娲诲姩鍥俱€乁ML 绫诲浘銆乁ML 鏃跺簭鍥撅紱鍥涚被 UML 鍥惧潎鐢辫剼鏈敓鎴愬埌 `output/presentation/assets/`銆?
- 閲嶆柊鐢熸垚 `output/presentation/toeic-practice-studio-final-report.pptx`銆?0 寮犻〉闈㈤瑙堛€乣contact-sheet.png`銆乣speaker-notes.md` 鍜?`manifest.json`銆?
- 楠岃瘉缁撴灉锛歅PTX 鍐呴儴 slide XML 鏁伴噺涓?20锛?0 椤靛潎瀛樺湪 transition/timing 鑺傜偣锛涙櫘閫氬够鐏墖鏃犲彲瑙佸崰浣嶇娈嬬暀锛汸PTX 鍐呴儴 XML 鏈鍑虹湡瀹炵櫥褰曞嚟鎹€佸瘑閽ユā寮忔垨鏁忔劅璇锋眰澶存ā寮忥紱棰勮鍥惧凡鎶芥煡绗?5銆?銆?0銆?1 椤碉紝UML 鍥惧拰璇剧▼鎴浘鏈鎷変几鍙樺舰鎴栨槑鏄鹃噸鍙犮€?
- 鏈鏈慨鏀逛笟鍔′唬鐮併€佹湭淇敼 `package.json` / `package-lock.json`锛屾湭鏂板椤圭洰杩愯渚濊禆銆?

## 2026-05-10 / 璇惧爞姹囨姤 PPT 澧炲己鐗?

- 閲嶅啓 `output/presentation/src/build-report-deck.mjs`锛屽皢璇惧爞姹囨姤 PPT 浠?15 椤靛崌绾т负 20 椤甸珮淇℃伅閲忕増鏈€?
- 鏂扮増 PPT 瑕嗙洊瀛︿範鐥涚偣銆佷骇鍝佺洰鏍囥€佺敤鎴烽棴鐜€乻pec-driven coding銆佹枃妗ｉ摼璺€乀01-T22 鎺ㄨ繘璇佹嵁銆佹妧鏈灦鏋勩€佹暟鎹ā鍨嬨€丄I 鐢熸垚閾捐矾銆佸畨鍏ㄨ竟鐣屻€佸惉鍔?璇硶/閿欓/缁熻灞曠ず銆乁I 杩唬銆侀獙鏀剁粨鏋溿€佽鍫傛紨绀鸿矾绾垮拰鎬荤粨鍙嶆€濄€?
- 淇鎴浘妯悜鎷変几闂锛氭墍鏈夋埅鍥鹃€氳繃鍘熷瀹介珮涓?`contain` / `cover` 瑙勫垯绛夋瘮渚嬫斁缃紱闀挎埅鍥句娇鐢ㄥ眬閮ㄨ仛鐒︼紝涓嶅帇鎵佹暣寮犲浘銆?
- 澧炲姞璇惧爞灞曠ず瑙嗚鍏冪礌锛氬師鐢熷舰鐘跺崱閫氫汉鐗┿€佸璇濇皵娉°€佹祦绋嬭妭鐐广€佽瘉鎹爣绛俱€佹枃妗ｅ崱鐗囥€佷换鍔＄煩闃点€佹灦鏋勫浘銆佹暟鎹ā鍨嬪浘鍜屾埅鍥炬爣娉ㄣ€?
- 澧炲姞 PPTX XML 鍔ㄧ敾鍚庡鐞嗭細涓?20 寮犲够鐏墖娉ㄥ叆杞満鍜?timing 鑺傜偣锛涘鏉傚璞″姩鐢讳粛闇€ PowerPoint 妗岄潰鐗堟挱鏀鹃獙璇併€?
- 閲嶆柊鐢熸垚 `output/presentation/toeic-practice-studio-final-report.pptx`銆乣output/presentation/previews/slide-01.png` 鑷?`slide-20.png`銆乣output/presentation/previews/contact-sheet.png`銆乣output/presentation/speaker-notes.md` 鍜?`output/presentation/manifest.json`銆?
- 楠岃瘉缁撴灉锛歅PTX 鍐呴儴 slide XML 鏁伴噺涓?20锛?0 椤靛潎瀛樺湪 transition/timing 鑺傜偣锛涙櫘閫氬够鐏墖鏃犲彲瑙佸崰浣嶇娈嬬暀锛涙湭妫€鍑虹湡瀹炲瘑閽ャ€丅earer銆丄uthorization 鎴栨晱鎰熺幆澧冩枃浠跺悕锛涢瑙堝浘宸叉娊鏌ワ紝鎴浘鏈鎷変几鍙樺舰銆?
- 鏈鏈慨鏀逛笟鍔′唬鐮併€佹湭淇敼 `package.json`銆佹湭鏂板椤圭洰杩愯渚濊禆銆?

## 2026-05-09 / 鍚姏鍥剧墖鎻忚堪鐪熷疄閰嶅浘

- 涓?`Question` 澧炲姞 `imageUrl` 鍜?`imagePrompt` 瀛楁锛屽苟鏂板 Prisma 杩佺Щ `20260509000000_add_question_images`銆?
- 鏂板 `lib/image-generation.ts`锛屼娇鐢ㄦ湇鍔＄ `OPENAI_API_KEY` 璋冪敤 OpenAI Image API锛岄粯璁?`OPENAI_IMAGE_MODEL=gpt-image-2`锛岃繑鍥?data URL銆?
- 寮哄寲鍚姏 `picture-description` Prompt锛岃姹傝繑鍥?`imagePrompt`锛屽苟瑕佹眰鍥剧墖鏃犳枃瀛椼€佹棤鍟嗘爣銆侀€傚悎 TOEIC Part 1銆?
- 鐢熸垚鎺ュ彛鍦?`picture-description` 棰樺瀷涓厛鐢熸垚棰樼洰 JSON锛屽啀閫愰鐢熸垚鍥剧墖锛屽浘鐗囩敓鎴愬け璐ユ椂涓嶄繚瀛樺崐鎴愬搧棰樼洰銆?
- 缁冧範椤靛湪棰樼洰瀛樺湪 `imageUrl` 鏃跺睍绀虹湡瀹為厤鍥撅紝骞朵繚鎸佸惉鍔涙彁浜ゅ墠闅愯棌鑻辨枃閫夐」姝ｆ枃銆?
- 鏇存柊 `.env.local.example` 鍜?`readme.md`锛岃ˉ鍏?OpenAI 鍥剧墖鐢熸垚鎵€闇€鐜鍙橀噺銆?
- 鎵ц `npx prisma migrate deploy`銆乣npx prisma generate`銆乣npm run lint`銆乣npm run build` 鍧囬€氳繃锛涚己灏?OpenAI Key 鐨勯厤缃敊璇獙璇佽繑鍥?`OPENAI_IMAGE_CONFIG_MISSING`銆?

## 2026-05-08

- 鍒涘缓 `spec.md`锛岀敤浜?TOEIC 缁冧範缃戦〉鐨?spec-driven coding 寮€鍙戝墠瀹℃牳銆?
- 鍒涘缓鏈€灏?`docs/project-context.md`锛岃褰曞綋鍓嶄负绌虹櫧瑙勫垝椤圭洰銆佸皻鏈惎鍔ㄥ紑鍙戙€?
- 鏈畨瑁呬緷璧栵紝鏈垱寤轰笟鍔′唬鐮侊紝鏈惎鍔ㄥ紑鍙戞湇鍔″櫒銆?

## 2026-05-08 Gate 1

- 鎸夋湰鍦?API Key 鐨?spec-driven 娴佺▼閲嶅啓 `spec.md` 涓?Draft 瀹℃牳绋裤€?
- 鏄庣‘ `spec.md -> design.md -> tasks.md -> implementation -> acceptance.md` 闂搁棬銆?
- 鏄庣‘鏈湴鍚庣璇诲彇 `MAAS_API_KEY`锛屽墠绔笉寰楃洿鎺ユ寔鏈?API Key銆?
- 鏄庣‘鍚姏缁冧範绛旈鍓嶉殣钘忚嫳鏂囬€夐」姝ｆ枃锛屾彁浜ゅ悗鍐嶆樉绀恒€?
- 鍚屾鏇存柊 `docs/project-context.md`锛屼粛鏈惎鍔ㄥ紑鍙戙€佹湭瀹夎渚濊禆銆佹湭鍒涘缓涓氬姟浠ｇ爜銆?

## 2026-05-08 Gate 2

- 鏍规嵁鐢ㄦ埛纭锛屽皢 `spec.md` 鐘舵€佷粠 `Draft` 鏇存柊涓?`Approved`銆?
- 鏂板 `design.md`锛岃鐩栨灦鏋勩€侀〉闈€佹暟鎹簱銆丄PI銆丮aaS 璋冪敤銆丳rompt銆侀敊璇鐞嗗拰娴嬭瘯绛栫暐銆?
- 鍚屾鏇存柊 `docs/project-context.md`锛屽綋鍓嶉樁娈典负 Gate 2 璁捐瀹℃牳涓€?
- 鏈敓鎴?`tasks.md`锛屾湭鍒濆鍖?Next.js锛屾湭瀹夎渚濊禆锛屾湭鍒涘缓涓氬姟浠ｇ爜銆?

## 2026-05-08 Gate 3

- 鏍规嵁鐢ㄦ埛鈥滆繘鍏?Gate 3鈥濈殑纭锛屽皢 `design.md` 鐘舵€佷粠 `Draft` 鏇存柊涓?`Approved`銆?
- 鏂板 `tasks.md`锛屽皢鍚庣画寮€鍙戞媶鍒嗕负 T01 鍒?T15 鐨勫彲楠屾敹浠诲姟銆?
- 鍚屾鏇存柊 `spec.md` 鍜?`docs/project-context.md`锛屽綋鍓嶉樁娈典负 Gate 3 浠诲姟瀹℃牳涓€?
- 鏈垵濮嬪寲 Next.js锛屾湭瀹夎渚濊禆锛屾湭鍒涘缓涓氬姟浠ｇ爜锛屾湭鐢熸垚 `acceptance.md`銆?

## 2026-05-08 Gate 4 / T01

- 鏍规嵁鐢ㄦ埛纭锛屽皢 `tasks.md` 鐘舵€佷粠 `Draft` 鏇存柊涓?`Approved`锛岄」鐩繘鍏?Gate 4銆?
- 鍒涘缓 Next.js + TypeScript 鏈€灏忛」鐩鏋躲€?
- 鏂板 `.gitignore`锛岀‘淇?`.env.local` 涓嶆彁浜ゃ€?
- 鏂板 `acceptance.md`锛屽紑濮嬭褰曚换鍔￠獙鏀躲€?
- 鎵ц `npm install` 瀹屾垚渚濊禆瀹夎骞剁敓鎴愰攣鏂囦欢銆?
- 鎵ц `npm run build` 閫氳繃鐢熶骇鏋勫缓銆?
- 鍚姩鏈湴 dev server锛屽苟楠岃瘉 `http://127.0.0.1:3000` 杩斿洖 200銆?
- 琛ュ厖 ESLint flat config锛岄€傞厤 ESLint 9銆?
- 褰撳墠鍙畬鎴?T01锛屽皻鏈帴鍏?Tailwind銆乻hadcn/ui銆丳risma銆丼QLite 鎴?MaaS 涓氬姟浠ｇ爜銆?

## 2026-05-08 Gate 4 / T02

- 鎺ュ叆 Tailwind CSS v4 涓?PostCSS 閰嶇疆銆?
- 鎺ュ叆 shadcn/ui锛岀敓鎴?`components.json`銆乣lib/utils.ts` 鍜屽熀纭€ UI 缁勪欢銆?
- 鏂板 Button銆丆ard銆両nput銆丼elect銆乀abs銆丅adge銆丄lert銆丏ialog銆丼eparator銆?
- 棣栭〉鏀逛负娓叉煋 shadcn Button銆丆ard銆丅adge 鍜?lucide 鍥炬爣锛岀敤浜庨獙璇?UI 鍩虹璁炬柦銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?
- 楠岃瘉 `http://127.0.0.1:3000` 杩斿洖 200锛屽苟鍖呭惈 T02 椤甸潰鍐呭銆?
- 褰撳墠鍙畬鎴?T02锛屽皻鏈帴鍏?Prisma銆丼QLite 鎴?MaaS 涓氬姟浠ｇ爜銆?

## 2026-05-08 Gate 4 / T03

- 瀹夎骞跺浐瀹?Prisma 6.19.3 涓?`@prisma/client` 6.19.3銆?
- 鏂板 Prisma SQLite schema锛屽寘鍚?`Question`銆乣PracticeRecord`銆乣Mistake`銆乣UserSetting`銆?
- 鏂板 `lib/prisma.ts`锛屽鐢ㄥ紑鍙戠幆澧?Prisma Client 瀹炰緥銆?
- Prisma 7 涓?Prisma 6 鐨?`migrate dev` 鍦ㄥ綋鍓嶇幆澧冭繑鍥炵┖ schema engine 閿欒锛涘凡閫氳繃 `migrate diff` 绛変环 SQL銆乣prisma db execute`銆乣migrate resolve --applied` 鍜?`migrate deploy` 瀹屾垚鏈湴 SQLite baseline銆?
- SQLite 鏁版嵁搴撲綅浜?`C:\Users\ALGH\toeic-practice-studio\dev.db`锛岄伩鍏?Windows 涓枃椤圭洰璺緞褰卞搷 Prisma engine銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T04

- 鏂板 `components/app-shell.tsx`锛屾彁渚涘叏灞€鏍囬銆佷富瀵艰埅鍜屽唴瀹瑰鍣ㄣ€?
- 鏂板 `components/empty-state.tsx`锛岀敤浜庢湭瀹炵幇椤甸潰鐨勭粺涓€绌虹姸鎬併€?
- 鏇存柊棣栭〉涓哄熀纭€浠〃鐩樺３锛屽睍绀?0 鍊肩粺璁′笌鏍稿績鍏ュ彛銆?
- 鏇存柊鍚姏銆佽娉曘€侀敊棰樸€佺粺璁°€佽缃〉闈负绌虹姸鎬佸３銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?
- 楠岃瘉 `/`銆乣/listening`銆乣/grammar`銆乣/mistakes`銆乣/stats`銆乣/settings` 鍧囪繑鍥?200銆?

## 2026-05-08 Gate 4 / T05

- 鏂板璁剧疆鏈嶅姟 `lib/settings-service.ts` 鍜屽父閲?`lib/constants.ts`銆?
- 鏂板 `GET /api/settings`銆乣PATCH /api/settings`銆乣POST /api/settings/clear-data`銆?
- 璁剧疆椤垫敼涓虹湡瀹炲彲鎿嶄綔鐣岄潰锛屾樉绀?API Key 鏄惁宸查厤缃€丮aaS Base URL銆丮aaS Model銆侀粯璁ら毦搴︺€侀粯璁ら閲忓拰鍚姏璇€熴€?
- 鏂板 `.env.local.example`锛屽彧鍖呭惈鍗犱綅绗︼紝涓嶅寘鍚湡瀹?API Key銆?
- 楠岃瘉璁剧疆璇诲彇銆佷繚瀛樸€佹竻闄ゆ暟鎹潎鍙敤锛汚PI 涓嶈繑鍥炲畬鏁?API Key銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T06

- 鏂板 `lib/maas-client.ts`锛屽皝瑁?MaaS Chat Completions 璋冪敤銆?
- 鏂板 `prompts/generate-listening-question.ts` 鍜?`prompts/generate-grammar-question.ts`銆?
- 鏂板 `lib/question-validation.ts`锛屾牎楠屼弗鏍?JSON銆丄/B/C/D 閫夐」銆佸敮涓€绛旀銆佸惉鍔涜剼鏈拰璇硶鐐广€?
- 鏂板 `lib/question-generation.ts`锛岀粍鍚?Prompt銆丮aaS 璋冪敤鍜岄鐩牎楠屻€?
- 鏂板 `lib/errors.ts`锛岀粺涓€鍙帶閿欒绫诲瀷銆?
- 浣跨敤 `npx tsx` 楠岃瘉鍚堟硶 JSON銆丮arkdown 鍝嶅簲鍜岀己瀛楁鍝嶅簲鐨勫鐞嗙粨鏋溿€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T07

- 鏂板 `POST /api/ai/generate-questions`銆?
- 瀹炵幇缁冧範绫诲瀷銆侀鍨嬨€侀毦搴︺€侀閲忓拰鏍囩璇锋眰鏍￠獙銆?
- 鐢熸垚鎺ュ彛璋冪敤 T06 鐨?MaaS 鐢熸垚涓庨鐩牎楠屾湇鍔°€?
- 鍚堟牸棰樼洰鍐欏叆 SQLite 鐨?`Question` 琛ㄣ€?
- 缂哄皯鏈湴 `MAAS_API_KEY` 鏃惰繑鍥?`MAAS_CONFIG_MISSING`锛屼笉鍚戝墠绔毚闇?Key銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T08

- 鏂板 `lib/practice-service.ts`锛屽疄鐜扮瓟棰樺垽鍒嗗拰缁冧範璁板綍鍐欏叆銆?
- 鏂板 `lib/mistake-service.ts`锛屽疄鐜伴敊棰樺垱寤恒€侀噸澶嶇瓟閿欒鏁板拰鐘舵€佸洖閫€銆?
- 鏂板 `POST /api/practice-records`銆?
- 浣跨敤鏈湴娴嬭瘯棰橀獙璇佺瓟瀵广€佺瓟閿欍€侀噸澶嶇瓟閿欓棴鐜€?
- 楠岃瘉瀹屾垚鍚庢竻闄ゆ祴璇曟暟鎹€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T09

- 鏂板 `components/practice-workspace.tsx`锛屽疄鐜扮敓鎴愰鐩€侀€夋嫨绛旀銆佹彁浜ょ瓟妗堝拰缁撴灉灞曠ず鐘舵€佹満銆?
- 鍚姏椤垫帴鍏ョ粌涔犲伐浣滃尯銆?
- 鍚姏绛旈鍓嶅彧鏄剧ず A/B/C/D 鍜岄殣钘忔彁绀猴紝涓嶅睍绀鸿嫳鏂囬€夐」姝ｆ枃銆?
- 鍚姏椤垫彁渚涙祻瑙堝櫒 Web Speech 鎾斁涓庡仠姝㈡帶鍒躲€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?
- 楠岃瘉 `/listening` 杩斿洖 200锛涚湡瀹?MaaS 棰樼洰鐢熸垚闇€鏈湴 `.env.local` 閰嶇疆 API Key 鍚庤ˉ娴嬨€?

## 2026-05-08 Gate 4 / T10

- 璇硶椤垫帴鍏?`components/practice-workspace.tsx`銆?
- 璇硶椤垫敮鎸侀鍨嬨€侀毦搴︺€侀閲忋€佹爣绛惧拰璇硶鐐硅緭鍏ャ€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?
- 楠岃瘉 `/grammar` 杩斿洖 200锛涚湡瀹?MaaS 棰樼洰鐢熸垚闇€鏈湴 `.env.local` 閰嶇疆 API Key 鍚庤ˉ娴嬨€?

## 2026-05-08 Gate 4 / T11

- 鏂板 `GET /api/mistakes` 鍜?`PATCH /api/mistakes/:id`銆?
- 鏂板 `components/mistakes-panel.tsx`锛屾彁渚涢敊棰樺垪琛ㄣ€佺瓫閫夈€佽鎯呫€佹爣璁版帉鎻°€佺Щ闄ゅ拰绗旇鍏ュ彛銆?
- 閿欓椤垫帴鍏ョ湡瀹為敊棰樺垪琛ㄣ€?
- 浣跨敤娴嬭瘯閿欓楠岃瘉鍒楄〃璇诲彇銆佹爣璁版帉鎻°€佺Щ闄ゅ拰榛樿鍒楄〃杩囨护銆?
- 楠岃瘉瀹屾垚鍚庢竻闄ゆ祴璇曟暟鎹€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T12

- 鏂板 `lib/stats-service.ts`锛屼粠 `PracticeRecord` 鍜?`Mistake` 瀹炴椂璁＄畻缁熻銆?
- 鏂板 `GET /api/stats`銆?
- 缁熻椤垫帴鍏ョ湡瀹炵粺璁℃暟鎹紝灞曠ず姹囨€绘寚鏍囥€佹渶杩?7 澶╄秼鍔垮拰钖勫急鏍囩銆?
- 淇鏈€杩?7 澶╂棩鏈熼敭浣跨敤 UTC 瀵艰嚧浠婂ぉ鏁版嵁閿欎綅鐨勯棶棰橈紝鏀逛负鏈満鏃ユ湡鏍煎紡鍖栥€?
- 浣跨敤娴嬭瘯璁板綍楠岃瘉缁熻缁撴灉锛岄獙璇佸畬鎴愬悗娓呴櫎娴嬭瘯鏁版嵁銆?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T13

- 妫€鏌?API Key 杈圭晫锛氬綋鍓嶆湭鍒涘缓 `.env.local`锛宍.env` / `.env.local` / `.env*.local` 鍧囧凡蹇界暐銆?
- 妫€鏌ュ墠绔叕寮€鍙橀噺銆佹祻瑙堝櫒瀛樺偍銆佸嵄闄?HTML 娓叉煋鍜屾棩蹇楄皟鐢ㄣ€?
- 纭 `MAAS_API_KEY` 鍙湪鏈嶅姟绔缃姸鎬佹湇鍔′笌 MaaS client 涓鍙栥€?
- 鎵ц `npm run lint` 鍜?`npm run build` 鍧囬€氳繃銆?

## 2026-05-08 Gate 4 / T14

- 鎵ц `npm run lint`銆乣npm run build`銆乣npx prisma migrate deploy`锛屽潎閫氳繃銆?
- 鎵ц鏍稿績椤甸潰涓?API HTTP smoke锛屽潎杩斿洖 200銆?
- 鏂板 `scripts/smoke/browser-smoke.mjs`锛屼娇鐢?Playwright + 鏈満 Edge 楠岃瘉鏍稿績椤甸潰鏈夊彲璇诲唴瀹广€?
- 瀹夎寮€鍙戞湡渚濊禆 `playwright`锛屼粎鐢ㄤ簬娴忚鍣ㄩ獙鏀躲€?

## 2026-05-08 Gate 5 / T15

- 鏇存柊 `acceptance.md`锛屾眹鎬?T01-T15銆丮VP 楠屾敹椤瑰拰鍓╀綑闃诲椤广€?
- 鏍囪 MaaS 鐪熷疄鐢熸垚楠屾敹涓?`BLOCKED`锛岀瓑寰呮湰鏈?`.env.local` 閰嶇疆 API Key 鍚庤ˉ娴嬨€?

## 2026-05-08 Gate 5 / MaaS 琛ユ祴

- 鏍规嵁鐢ㄦ埛鎻愪緵鐨勬湰鍦?MaaS Key 閰嶇疆 `.env.local`锛屼繚鎸?`.gitignore` 蹇界暐瑙勫垯涓嶅彉銆?
- 鍦?MaaS 璇锋眰浣撲腑琛ュ厖 `response_format: { type: "json_object" }`銆?
- 灏?AI JSON 瑙ｆ瀽澧炲己涓轰粎鍏煎鈥滃畬鏁村搷搴斾负 JSON 浠ｇ爜鍧椻€濈殑鎯呭喌锛屽墺绂诲灞備唬鐮佸潡鍚庝粛鎵ц涓ユ牸瀛楁鏍￠獙銆?
- 浣跨敤鐪熷疄 MaaS 璋冪敤鐢熸垚 1 閬撹娉曢鍜?1 閬撳惉鍔涢锛屽苟鍐欏叆 SQLite銆?
- 楠岃瘉 `GET /api/settings` 鍙繑鍥?`hasApiKey`锛屼笉杩斿洖瀹屾暣 Key銆?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs`锛屽潎閫氳繃銆?
- 鏇存柊 `acceptance.md`锛屽皢鍚姏/璇硶 MaaS 瀹為鐢熸垚琛ユ祴鐘舵€佹洿鏂颁负 `PASS`銆?

## 2026-05-08 V1.1 / UI 鎵撶（

- 鎸?spec-driven 娴佺▼琛ュ厖 `spec.md`銆乣design.md`銆乣tasks.md` 鐨?V1.1 UI 鎵撶（鑼冨洿銆?
- 棣栭〉鏀逛负鏈嶅姟绔鍙?`getStats()`锛屽睍绀虹湡瀹炰粖鏃ョ粌涔犮€佷粖鏃ユ纭巼銆佹€荤粌涔犲拰褰撳墠閿欓銆?
- 棣栭〉鍜岀粺璁￠〉璁剧疆涓哄姩鎬佹覆鏌擄紝閬垮厤 SQLite 缁熻鍦ㄦ瀯寤烘椂琚浐鍖栥€?
- 浼樺寲棣栭〉鍏ュ彛灞傜骇锛屽姞鍏ュ惉鍔涖€佽娉曘€侀敊棰樻湰鍜岀粺璁＄殑蹇嵎鍏ュ彛銆?
- 浼樺寲鍏ㄥ眬瀵艰埅澹筹紝澧炲姞 sticky header 鍜屽綋鍓嶅鑸殑杞婚噺楂樹寒銆?
- 浼樺寲缁冧範宸ヤ綔鍖猴紝澧炲姞闃熷垪 / 宸叉彁浜?/ 闅惧害鐘舵€併€侀鍨嬫憳瑕併€侀€夐」閫変腑鎬佸拰鎻愪氦鍚庣殑姝ｇ‘ / 閿欒鍙嶉銆?
- 淇濇寔鍚姏绛旈鍓嶉殣钘忚嫳鏂囬€夐」姝ｆ枃銆丄PI Key 鏈嶅姟绔鍙栧拰 MaaS / 绛旈 API 涓嶅彉銆?
- 鎵ц `npm run lint`銆乣npm run build`銆乣npx prisma migrate deploy`銆乣node scripts/smoke/browser-smoke.mjs`锛屽潎閫氳繃銆?

## 2026-05-08 V1.2 / 涓板瘜鍔ㄦ晥涓庢椿鍔涢噸璁捐

- 鎸?spec-driven 娴佺▼琛ュ厖 `spec.md`銆乣design.md`銆乣tasks.md` 鐨?V1.2 鍔ㄦ晥鍜岃瑙夎寖鍥淬€?
- 鏂板 `motion` 渚濊禆锛屽垱寤?`components/motion-ui.tsx`锛屾彁渚涢〉闈㈣繘鍏ャ€乻tagger銆乭over / tap 鍔ㄦ晥瀹瑰櫒銆?
- 鏂板 `components/cartoon-sticker.tsx`锛岀敤浠ｇ爜鍘熺敓 TSX / CSS 瀹炵幇棣栭〉鍜岀粌涔犻〉璐寸焊寮忓崱閫氳瑙夈€?
- 棣栭〉鎺ュ叆 Motion 椤甸潰杩涘叆銆佺粺璁″崱鐗?stagger銆佸揩鎹峰叆鍙?hover / tap 鍔ㄦ晥銆?
- 鍚姏椤靛拰璇硶椤垫帴鍏ラ鐩垏鎹€侀€夐」鍙嶉銆佺粨鏋滃弽棣堝姩鏁堛€?
- `app/globals.css` 澧炲姞鍏ㄥ眬鍔ㄦ€佺綉鏍艰儗鏅€佸惉鍔涘０娉㈣儗鏅€佽娉曟紓娴瘝鍧楄儗鏅紝骞舵敮鎸?`prefers-reduced-motion` 闄嶇骇銆?
- 娓呯悊鏃у師鍨嬮仐鐣欑殑鍏ㄥ眬 `h1/h2/p` 鏍峰紡锛岄伩鍏嶈鐩?Tailwind 椤甸潰瀛楀彿銆?
- 淇濇寔 MaaS銆丼QLite銆佺瓟棰樿褰曘€侀敊棰樺拰缁熻 API 涓嶅彉銆?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs`锛屽潎閫氳繃銆?
- 浣跨敤 Playwright 鎴浘妫€鏌ラ椤点€佸惉鍔涢〉銆佽娉曢〉锛屾埅鍥句繚瀛樺埌 `output/playwright/`銆?

## 2026-05-08 V1.3 / 缁冧範娴佺▼浣撻獙瀹屽杽

- 鎸?spec-driven 娴佺▼琛ュ厖 `spec.md`銆乣design.md`銆乣tasks.md` 鐨?V1.3 缁冧範娴佺▼浣撻獙鑼冨洿銆?
- 鍦?`components/practice-workspace.tsx` 涓柊澧炵敓鎴愪腑鐘舵€侀潰鏉匡紝閬垮厤鐢熸垚璇锋眰鏈熼棿浠嶆樉绀烘櫘閫氱瓑寰呯姸鎬併€?
- 鏂板缁冧範杩涘害鏉★紝灞曠ず宸叉彁浜ら鏁般€佹€婚鏁板拰瀹屾垚鐧惧垎姣斻€?
- 鏂板鏈€鍚庝竴棰樺畬鎴愰潰鏉匡紝鎻愪緵鈥滃啀鏉ヤ竴缁勨€濃€滄煡鐪嬮敊棰樷€濃€滃涔犵粺璁♀€濆叆鍙ｃ€?
- 浣跨敤 Playwright 鎷︽埅鏈湴 API 楠岃瘉鍚姏棰樻彁浜ゅ墠闅愯棌鑻辨枃閫夐」銆佹彁浜ゅ悗鏄剧ず鑻辨枃閫夐」鍜屽畬鎴愰潰鏉裤€?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs`锛屽潎閫氳繃銆?

## 2026-05-08 V1.4 / 瑙嗚瀵归綈涓庡搷搴斿紡宸℃

- 鎸?spec-driven 娴佺▼琛ュ厖 `spec.md`銆乣design.md`銆乣tasks.md` 鐨?V1.4 瑙嗚瀵归綈鍜屽搷搴斿紡宸℃鑼冨洿銆?
- 鏂板 `components/metric-card.tsx`锛岀粺涓€鎸囨爣鍗＄墖鐨勬爣棰樸€佹暟瀛椼€佸崟浣嶅拰鍩虹嚎瀵归綈銆?
- 棣栭〉缁熻鍖烘敼鐢?`MetricCard`锛屼慨澶嶆暟瀛椾笌鍗曚綅閿欎綅闂銆?
- 缁熻椤垫眹鎬诲尯鏀圭敤鍚屼竴 `MetricCard`锛岄伩鍏嶅悓绫绘帓鐗堥棶棰樺鐜般€?
- 绉诲姩绔《閮ㄥ鑸粠妯悜婊氬姩鏀逛负鑷姩鎹㈣锛屾秷闄ょЩ鍔ㄧ鍙鍏冪礌婧㈠嚭鍊欓€夈€?
- 浣跨敤 Playwright 鐢熸垚棣栭〉銆佺粺璁￠〉銆佸惉鍔涢〉銆佽娉曢〉鐨勬闈㈠拰绉诲姩绔埅鍥撅紝骞舵墽琛?bounding box 宸℃锛涙牳蹇冮〉闈㈠潎鏃犳枃鏈孩鍑哄€欓€夈€?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs`锛屽潎閫氳繃銆?

## 2026-05-08 / 鍚姩鏂囨。

- 鏂板鏍圭洰褰?`readme.md`锛岃褰曟湰鏈哄惎鍔ㄣ€丮aaS 鐜鍙橀噺銆丳risma / SQLite銆佸父鐢ㄩ獙璇佸懡浠ゅ拰鐢熶骇妯″紡鏈湴棰勮鏂规硶銆?
- 鍦ㄥ惎鍔ㄦ枃妗ｄ腑琛ュ厖 API Key 瀹夊叏娉ㄦ剰浜嬮」锛屾槑纭湡瀹?Key 涓嶅啓鍏ユ簮鐮併€佹枃妗ｃ€丟it 鎴栧墠绔叕寮€鐜鍙橀噺銆?
- 琛ュ厖缂哄皯 `MAAS_API_KEY`銆佹暟鎹簱鍛戒护澶辫触銆侀〉闈㈡牱寮忔垨鍔ㄦ晥寮傚父鏃剁殑鎺掓煡姝ラ銆?

## 2026-05-09 / MaaS 鍏ㄩ鍨嬬敓鎴愰獙鏀?

- 鍚姩鏈湴 dev server锛岄獙璇?`GET /api/settings` 杩斿洖 `hasApiKey: true`锛屾湭鍥炴樉瀹屾暣 API Key銆?
- 閫氳繃 `POST /api/ai/generate-questions` 瀵瑰墠绔?9 涓瓙棰樺瀷鍚勭敓鎴?1 閬撻銆?
- 鍚姏 4 涓瓙棰樺瀷鍧囪繑鍥?200銆佸瓧娈垫牎楠岄€氳繃锛屽苟鍐欏叆 SQLite锛歚picture-description`銆乣question-response`銆乣short-conversation`銆乣short-talk`銆?
- 璇硶 5 涓瓙棰樺瀷鍧囪繑鍥?200銆佸熀纭€瀛楁鏍￠獙閫氳繃锛屽苟鍐欏叆 SQLite锛歚sentence-completion`銆乣part-of-speech`銆乣tense-voice`銆乣preposition-conjunction`銆乣business-context`銆?
- 鍙戠幇妯″瀷瀵瑰瓙棰樺瀷閬靛惊涓嶇ǔ瀹氾細`tense-voice` 鍜?`business-context` 璇锋眰杩斿洖鐨?`subtype` 琚ā鍨嬪啓鎴?`sentence-completion`锛屽悗缁簲鏀剁揣鍚庣鏍￠獙鎴栧湪淇濆瓨鏃朵互璇锋眰瀛愰鍨嬭鐩栨ā鍨嬪瓙棰樺瀷銆?

## 2026-05-09 / 鐢熸垚閾捐矾瀛愰鍨嬬害鏉熷畬鍠?

- 鍦ㄩ鐩牎楠屼腑澧炲姞璇锋眰瀛愰鍨嬩竴鑷存€ф鏌ワ紝妯″瀷杩斿洖鐨?`subtype` 蹇呴』绛変簬璇锋眰鐨?`subtype`銆?
- MaaS 鐢熸垚閬囧埌 `subtype` 涓嶄竴鑷存椂鏈€澶氳嚜鍔ㄩ噸璇?1 娆★紝杩炵画涓嶄竴鑷村垯杩斿洖鏄庣‘閿欒銆?
- 寮哄寲鍚姏鍜岃娉?Prompt锛岃姹?`subtype` 涓?`difficulty` 鍘熸牱杩斿洖锛屽苟璁╃ず渚?JSON 浣跨敤褰撳墠璇锋眰鍊笺€?
- 鏂板 `scripts/smoke/generation-smoke.mjs` 鍜?`npm run smoke:generation`锛屼竴閿獙璇?9 涓墠绔瓙棰樺瀷鐨勭湡瀹炵敓鎴愩€佸瓧娈靛畬鏁存€с€佸瓙棰樺瀷涓€鑷存€у拰钀藉簱 ID銆?
- 鎵ц `npm run lint`銆乣npm run smoke:generation`銆乣npm run build` 鍧囬€氳繃锛涘娴?9 涓瓙棰樺瀷鍏ㄩ儴 PASS銆?

## 2026-05-09 / V1.5 棰樼洰鏌ヨ涓庨敊棰橀噸鏂扮粌涔?

- 鍦?`spec.md`銆乣design.md`銆乣tasks.md` 涓拷鍔?V1.5 / T20 鏂囨。闂幆銆?
- 鏂板 `GET /api/questions`锛屾敮鎸?`type`銆乣subtype`銆乣difficulty`銆乣tag`銆乣limit` 鏌ヨ宸茬敓鎴愰鐩€?
- 閿欓鏈崱鐗囨柊澧炩€滈噸鏂扮粌涔犫€濆叆鍙ｏ紝鍙湪鍗＄墖鍐呴€夋嫨 A/B/C/D 骞跺鐢?`POST /api/practice-records` 鎻愪氦銆?
- 閲嶆柊缁冧範鎻愪氦鍚庢樉绀烘纭?/ 閿欒缁撴灉锛屽苟鍒锋柊閿欓鍒楄〃锛涢噸澶嶇瓟閿欐部鐢?`wrongCount+1` 鍜?`reviewing` 鐘舵€佽鍒欍€?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs`銆乣npm run smoke:generation` 鍧囬€氳繃銆?

## 2026-05-09 / V1.6 棣栭〉 Hero 浠婃棩璁″垝鍗＄墖

- 鍦?`spec.md`銆乣design.md`銆乣tasks.md` 涓拷鍔?V1.6 / T21 鏂囨。闂幆銆?
- 淇棣栭〉 Hero 涓€滃紑濮嬪惉鍔涒€濇寜閽繁鑹茶儗鏅笅鏂囧瓧涓嶆竻鐨勯棶棰橈紝鏀逛负娣辩豢鑹茶儗鏅笌鐧借壊鏂囧瓧銆?
- 鍦ㄩ椤?Hero 宸︿晶鎸夐挳涓嬫柟鏂板鈥滀粖鏃ユ櫤鑳界粌涔犺鍒掆€濆崱鐗囷紝鍖呭惈涓夐」浠诲姟銆侀璁＄敤鏃躲€佸急椤规爣绛惧拰鈥滃紑濮嬩粖鏃ヨ鍒掆€濆叆鍙ｃ€?
- 鍗＄墖閲囩敤娴呯豢鑹插埌娴呯背鑹叉笎鍙樸€佹祬杈规銆佽交闃村奖鍜屾贰绾挎€ц€虫満鍥炬爣锛屼繚鎸佸彸渚ф彃鐢诲竷灞€涓嶅彉銆?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs` 鍧囬€氳繃锛屽苟鐢熸垚棣栭〉妗岄潰 / 绉诲姩绔埅鍥惧埌 `output/playwright/`銆?

## 2026-05-09 / V1.7 瀛︿範缁熻鍗￠€氫华琛ㄧ洏

- 鍦?`spec.md`銆乣design.md`銆乣tasks.md` 涓拷鍔?V1.7 / T22 鏂囨。闂幆銆?
- 鏂板 `recharts` 渚濊禆锛岀敤浜庢渶杩?7 澶╁弻鎶樼嚎 / 闈㈢Н鍥俱€?
- 灏?`/stats` 椤甸潰涓讳綋鎷嗕负 `components/stats-dashboard.tsx`锛屽寘鍚?`StatsHero`銆乣StatCard`銆乣WeeklyTrendCard`銆乣WeakTagsCard`銆?
- 瀛︿範缁熻 Hero 鏀逛负娴呯豢鑹?/ 濂舵补鑹插崱閫氭姤鍛婂尯锛屼繚鐣欏師鏍囬銆佸壇鏍囬鍜?Gate badge銆?
- 7 涓粺璁￠」鏀逛负杞诲崱閫氭暟鎹崱鐗囷紝姝ｇ‘鐜囧崱鐗囧鍔犵幆褰㈣繘搴︺€?
- 钖勫急鏍囩鏀逛负鏈夋潈閲嶅眰绾х殑鑳跺泭鏍囩锛屽苟澧炲姞灏忓瀷渚垮埄璐存彃鐢汇€?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs` 鍧囬€氳繃锛屽苟鐢熸垚缁熻椤垫闈?/ 绉诲姩绔埅鍥惧埌 `output/playwright/`銆?

## 2026-05-09 / 缁熻椤佃杽寮辨爣绛惧浘鏍囧榻愪慨澶?

- 淇 `WeakTagsMascot` 鍐呬功鏈浘鏍囦笌鐧借壊渚跨鑳屾櫙閿欎綅鐨勯棶棰樸€?
- 灏嗘彃鐢诲鍣ㄦ敼涓哄眳涓竷灞€锛屼功鏈浘鏍囦笌鑳屾櫙鍚屽績瀵归綈锛屾槦鏄熷浐瀹氬湪鍙充笂瑙掋€?
- 鎵ц `npm run lint`銆乣npm run build` 鍧囬€氳繃锛屽苟鐢熸垚 `output/playwright/v1-7-stats-icon-fix-desktop.png` 澶嶆牳鎴浘銆?

## 2026-05-09 / 缁熻椤垫姌绾垮浘棰滆壊鍖哄垎淇

- 灏嗘渶杩?7 澶╁浘琛ㄧ殑鈥滄纭鏁扳€濅粠钃濈豢鑹茶皟鏁翠负鏆栨鑹诧紝鍜屸€滅粌涔犻鏁扳€濈殑缁胯壊褰㈡垚鏇存槑鏄惧尯鍒嗐€?
- 鍚屾璋冩暣椤堕儴鍥句緥鑳跺泭鍜岄潰绉～鍏呴鑹层€?
- 鎵ц `npm run lint`銆乣npm run build` 鍧囬€氳繃锛屽苟鐢熸垚 `output/playwright/v1-7-stats-chart-color-fix-desktop.png` 澶嶆牳鎴浘銆?

## 2026-05-09 / 鏈満鍚庣鍏綉璁块棶璇存槑

- 鏂板 `npm run dev:public` 鍜?`npm run start:public`锛岀敤浜庤 Next.js 鐩戝惉 `0.0.0.0:3000`銆?
- 鏇存柊 `readme.md`锛岃ˉ鍏呮湰鏈鸿繍琛屾椂閫氳繃 Cloudflare Quick Tunnel 涓存椂鍏綉璁块棶鐨勬柟娉曘€?
- 鏇存柊 `readme.md`锛岃ˉ鍏呭浐瀹氬煙鍚?Cloudflare Tunnel 閰嶇疆銆佽繍琛屾柟寮忋€佹帓鏌ユ楠ゅ拰瀹夊叏娉ㄦ剰浜嬮」銆?
- 淇 `.env.local.example`锛屽皢鐪熷疄 MaaS Key 鏇挎崲鍥炲崰浣嶇锛岄伩鍏嶇ず渚嬫枃浠舵硠闇插瘑閽ャ€?
- 鎵ц `npm run lint`銆乣npm run build` 鍧囬€氳繃銆?

## 2026-05-09 / Cloudflare Quick Tunnel 鍚姩鑴氭湰

- 鏂板 `scripts/public/public-tunnel.ps1`锛岃嚜鍔ㄥ畾浣?`cloudflared.exe`銆佹鏌ユ湰鍦?`127.0.0.1:3000` 鏈嶅姟锛屽苟浣跨敤 IPv4 + HTTP/2 鍚姩 Quick Tunnel銆?
- 鑴氭湰鏀寔 `-CheckOnly`锛屽彲鍙獙璇?`cloudflared` 涓庢湰鍦版湇鍔″彲鐢ㄦ€э紝涓嶅惎鍔ㄩ暱椹诲叕缃戦毀閬撱€?
- 鑴氭湰浼氫粠 `cloudflared` 鏃ュ織涓彁鍙?`https://*.trycloudflare.com`锛屽苟鐢ㄤ腑鏂囬珮浜緭鍑衡€滃叕缃戣闂湴鍧€鈥濄€?
- 淇 Windows PowerShell 灏?`cloudflared` 鐨?stderr 鏃ュ織褰撲綔 `NativeCommandError` 涓柇鑴氭湰鐨勯棶棰樸€?
- 鏂板 `npm run tunnel:quick`锛岄檷浣?Windows PATH 鏈埛鏂般€佹墜鍔ㄥ懡浠ゆ崲琛屽拰涓存椂鎻℃墜澶辫触甯︽潵鐨勫惎鍔ㄨ鍒ゃ€?
- 鏇存柊 `readme.md`锛屽皢涓存椂鍏綉璁块棶娴佺▼鏀逛负浼樺厛浣跨敤 `npm run tunnel:quick`锛屽苟琛ュ厖 `Unauthorized: Tunnel not found`銆乣status_code=500` 绛夊父瑙佹棩蹇楄鏄庛€?
- 鐪熷疄楠屾敹 Cloudflare Quick Tunnel锛氭垚鍔熻幏鍙栦复鏃?`trycloudflare.com` 鍦板潃锛屽苟閫氳繃鍏綉鍦板潃璁块棶棣栭〉杩斿洖 200锛涢獙鏀跺悗宸插仠姝复鏃堕毀閬撹繘绋嬨€?

## 2026-05-09 / 鍏綉椤甸潰鍙樉绀鸿儗鏅慨澶?

- 淇 `components/motion-ui.tsx` 涓〉闈㈣繘鍏ュ姩鐢诲湪鏈嶅姟绔?HTML 闃舵杈撳嚭 `opacity:0` 鐨勯棶棰樸€?
- 灏?`MotionPage` 鍜?`MotionStagger` 鐨?`initial` 鏀逛负 `false`锛岀‘淇濆叕缃戠 JS chunk 鏆傛椂鏈姞杞芥椂浠嶈兘鏄剧ず瀹屾暣闈欐€侀〉闈㈠唴瀹广€?
- 鎵ц `npm run lint`銆乣npm run build`銆乣node scripts/smoke/browser-smoke.mjs` 鍧囬€氳繃銆?
- 鎵ц `npm run tunnel:quick -- -CheckOnly`锛岀‘璁ゆ湰鍦版湇鍔′笌 `cloudflared` 妫€鏌ラ€氳繃銆?

## 2026-05-09 / Tunnel 鑴氭湰涓枃涔辩爜淇

- 鍦?`scripts/public/public-tunnel.ps1` 鍚姩鏃惰缃帶鍒跺彴杈撳叆 / 杈撳嚭缂栫爜涓?UTF-8锛屽苟鍦?Windows 涓嬪垏鎹唬鐮侀〉鍒?`65001`銆?
- 灏嗚剼鏈唴鐩存帴杈撳嚭鐨勪腑鏂囨彁绀烘敼涓?Unicode 鐮佺偣鎷兼帴锛岄伩鍏?Windows PowerShell 5 璇诲彇 UTF-8 鏃?BOM 鑴氭湰鏃跺嚭鐜颁腑鏂囦贡鐮併€?
- 灏?`npm run tunnel:quick` 澧炲姞 `-NoProfile`锛屽噺灏戠敤鎴?PowerShell 閰嶇疆鏂囦欢瀵圭紪鐮佽缃殑褰卞搷銆?
- 鎵ц `npm run tunnel:quick -- -CheckOnly` 鍜?`npm run lint` 鍧囬€氳繃锛涘崟鐙獙璇佷腑鏂囨彁绀哄彲姝ｇ‘鏄剧ず銆?

## 2026-05-09 / 鍏綉瀹屾暣鍔熻兘楠屾敹涓庣偣鍑讳慨澶?

- 鏂板 `scripts/smoke/public-acceptance.mjs` 鍜?`npm run smoke:public`锛岀敤浜庡鍏綉 URL 杩涜 Playwright 楠屾敹銆?
- 楠屾敹瑕嗙洊妗岄潰 / 绉诲姩绔?6 涓〉闈㈠彲瑙佹帶浠?trial click銆侀《閮ㄥ鑸€侀椤靛叆鍙ｃ€佽娉曠敓鎴愪笌绛旈銆佸惉鍔涚敓鎴愪笌鎾斁 / 鍋滄 / 绛旈銆侀敊棰樼瓫閫変笌澶嶇粌銆佽缃埛鏂?/ 淇濆瓨 / 鎭㈠銆佹竻闄ゆ暟鎹脊绐楀拰缁熻 API / 鍥捐〃 / 钖勫急鏍囩銆?
- 灏嗛《灞傞〉闈㈠鑸笌鍏ュ彛閾炬帴鏀逛负鏅€?`<a href>`锛岄伩鍏?Cloudflare Quick Tunnel 涓?Next 瀹㈡埛绔?RSC 瀵艰埅鍋跺彂 502 瀵艰嚧鐐瑰嚮鍚庨〉闈笉瀹屾暣銆?
- 淇 `scripts/public/public-tunnel.ps1` 璇妸 `https://api.trycloudflare.com` 褰撲綔鍏綉璁块棶鍦板潃杈撳嚭鐨勯棶棰樸€?
- 鎵ц `npm run lint`銆乣npm run build` 鍧囬€氳繃銆?
- 浣跨敤鍏綉鍦板潃 `https://sent-murray-doctor-san.trycloudflare.com` 鎵ц `npm run smoke:public`锛岀粨鏋滀负 41 PASS銆? FAIL銆?

## 2026-05-09 / start:public 绔彛鍗犵敤鎻愮ず淇

- 鏂板 `scripts/public/start-public.ps1`锛屽湪鍚姩鍏綉鏈嶅姟鍓嶆鏌?`3000` 绔彛銆?
- 鑻?`3000` 宸茬粡鐢辨湰椤圭洰 `next start` 鍗犵敤锛宍npm run start:public` 浼氭彁绀烘湇鍔″凡鍦ㄨ繍琛屽苟姝ｅ父閫€鍑猴紝閬垮厤 `EADDRINUSE` 琚璁や负鍚姩澶辫触銆?
- 鑻?`3000` 琚叾浠栬繘绋嬪崰鐢紝浼氳緭鍑哄崰鐢ㄨ繘绋?PID 鍜屽懡浠よ锛屾柟渚垮鐞嗐€?
- 灏?`package.json` 涓殑 `start:public` 鏀逛负璋冪敤 `scripts/public/start-public.ps1`銆?
- 鎵ц `npm run start:public`銆乣npm run lint` 鍜?`GET /api/settings` 妫€鏌ュ潎閫氳繃銆?
## 2026-05-10 / 璇惧爞姹囨姤 PPT 浜у嚭

- 瀹夎琛ュ厖璁捐鎶€鑳?`figma-create-new-file` 鍒?`C:\Users\ALGH\.codex\skills\figma-create-new-file`锛屾湭鍐欏叆椤圭洰渚濊禆銆?
- 鏂板 `output/presentation/src/build-report-deck.mjs`锛屼娇鐢ㄦ湰鍦版紨绀烘枃绋胯繍琛屾椂渚濊禆鐢熸垚璇惧爞姹囨姤鏉愭枡銆?
- 鐢熸垚 15 椤佃鍫傜簿缇庡瀷姹囨姤 PPT锛歚output/presentation/toeic-practice-studio-final-report.pptx`銆?
- 鐢熸垚 15 寮犻€愰〉 PNG 棰勮涓庢€昏鍥撅細`output/presentation/previews/`銆?
- 鐢熸垚璁茬澶囨敞锛歚output/presentation/speaker-notes.md`銆?
- PPT 鍐呭瑕嗙洊寮€鍙戣儗鏅€乻pec-driven coding 娴佺▼銆佹妧鏈灦鏋勩€丄I 鐢熸垚閾捐矾銆佸惉鍔?璇硶/閿欓/缁熻鎴愭灉銆乁I 杩唬銆侀獙鏀跺畨鍏ㄥ拰璇惧爞婕旂ず璺嚎銆?
- QA锛氱‘璁?PPTX 鍐呭惈 15 涓?slide XML锛涢瑙堝浘鍏?15 椤碉紱鏅€氬够鐏墖涓湭鍙戠幇鍙 `Slide Number` / `sldNum` 鍗犱綅绗︼紱鏁忔劅瀛楁鎼滅储鏈懡涓湡瀹?Key銆丄uthorization 鎴?Bearer銆?
- 璇存槑锛氭湭淇敼涓氬姟浠ｇ爜锛屾湭淇敼 `package.json`锛屾湭鏂板杩愯鏃朵緷璧栵紱PPTX 鏈€氳繃 PowerPoint/Keynote 妗岄潰绋嬪簭鍋氫汉宸ユ墦寮€楠屾敹銆?

## 2026-05-14 / 涓や汉鍒嗗伐婕旇绋?

- 鍩轰簬 `output/presentation/toeic-practice-studio-final-report-slides6-8-redesign.pptx`銆乣output/presentation/speaker-notes.md`銆乣spec.md`銆乣design.md`銆乣acceptance.md` 鍜?`readme.md` 鐢熸垚涓や汉鍒嗗伐鐗堣鍫傛紨璁茬銆?
- 鏂板 `output/presentation/two-person-speech-script.md`锛屾寜绗?1-9 椤靛拰绗?10-19 椤垫媶鍒嗚鑰?A / 璁茶€?B銆?
- 鍐呭瑕嗙洊椤圭洰鑳屾櫙銆佸涔犵棝鐐广€乻pec-driven 娴佺▼銆佹妧鏈灦鏋勩€佹暟鎹ā鍨嬨€丄I 鐢熸垚閾捐矾銆佸惉鍔?璇硶/閿欓/缁熻鎴愭灉銆侀獙鏀剁粨鏋滃拰鎬荤粨鍙嶆€濄€?
- 鏈浠呮柊澧炴眹鎶ユ枃绋垮拰鍙樻洿璁板綍锛屾湭淇敼涓氬姟浠ｇ爜锛屾湭鏂板渚濊禆銆?
- 鍚庣画琛ュ厖 spec-driven 寮€鍙戞€荤粨銆佹敹鑾蜂笌涓汉浣撲細锛屽己璋冭竟鐣屾剰璇嗐€佷换鍔℃媶鍒嗐€侀獙鏀惰瘉鎹拰 AI 杈呭姪寮€鍙戜腑鐨勮鏍肩害鏉熶环鍊笺€?
