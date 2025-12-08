# プロジェクトのアンチパターン分析レポート

## 1. ロギングの直接使用（重大度: 高）

### 問題
ルールでは`console.log`、`console.error`、`console.warn`の直接使用が禁止されているが、多数のファイルで使用されている。

### 影響範囲
- `src/app/(private)/curriculum/CurriculumUi.tsx` - 2箇所
- `src/app/(private)/curriculum/components/CourseModal/actions/actions.ts` - 10箇所
- `src/app/(private)/curriculum/components/HomeroomModal/actions/actions.ts` - 4箇所
- `src/app/(private)/curriculum/actions/createBlock.ts` - 2箇所
- `src/app/(private)/constraints/components/ConstraintDefinitionModal/actions/actions.ts` - 4箇所
- `src/app/(private)/constraints/ConstraintDefinitionsUi.tsx` - 1箇所
- `src/app/api/optimize/route.ts` - 1箇所
- `src/app/api/optimize/service.ts` - 1箇所
- `src/app/(private)/results/fetcher.ts` - 2箇所
- `src/app/(private)/curriculum/actions/deleteBlock.ts` - 1箇所
- `src/app/(private)/curriculum/actions/updateBlock.ts` - 1箇所
- `src/lib/fastapi-client.ts` - 1箇所
- `src/app/(private)/constraints/components/ConstraintDefinitionModal/components/ParametersField.tsx` - 2箇所

### 推奨対応
すべての`console.log`、`console.error`、`console.warn`を`@/lib/logger`の適切なメソッドに置き換える。

**例外**: `src/lib/logger.ts`と`src/lib/api-logger.ts`内の使用は、ロガー実装の一部として許容される。

---

## 2. 型安全性の欠如（重大度: 中）

### 問題
`FormData.get()`の結果を`as string`で型アサーションしており、`null`の可能性を無視している。

### 影響範囲
- `src/app/(private)/curriculum/CurriculumUi.tsx` - 5箇所
- `src/app/(private)/curriculum/components/CourseModal/actions/actions.ts` - 6箇所
- `src/app/(private)/curriculum/components/HomeroomModal/actions/actions.ts` - 7箇所
- `src/app/(private)/curriculum/actions/*.ts` - 複数箇所
- `src/app/(private)/constraints/components/ConstraintDefinitionModal/actions/actions.ts` - 5箇所

### 例
```typescript
// ❌ アンチパターン
const courseId = formData.get('courseId') as string

// ✅ 推奨パターン
const courseId = formData.get('courseId')
if (!courseId || typeof courseId !== 'string') {
  return errorResult('courseIdが指定されていません')
}
```

### 推奨対応
`FormData.get()`の結果を適切に検証し、エラーハンドリングを追加する。

---

## 3. 巨大なコンポーネント（重大度: 中）

### 問題
`CurriculumUi.tsx`が約485行と非常に大きく、以下の問題がある：
- 多数の状態管理（10個以上の`useState`）
- 複数のモーダル管理ロジックが混在
- ビジネスロジックとUIロジックが混在

### 影響範囲
- `src/app/(private)/curriculum/CurriculumUi.tsx` (485行)

### 推奨対応
- モーダル管理ロジックをカスタムフックに分離
- 状態管理を`useReducer`や状態管理ライブラリに移行
- コンポーネントを機能ごとに分割

---

## 4. エラーハンドリングの一貫性の欠如（重大度: 中）

### 問題
エラー表示方法が統一されていない：
- `alert()`を使用している箇所がある
- エラーメッセージの表示方法がコンポーネントごとに異なる

### 影響範囲
- `src/app/(private)/curriculum/CurriculumUi.tsx` - 3箇所（`alert`使用）
- `src/app/(private)/constraints/ConstraintDefinitionsUi.tsx` - 4箇所（`alert`使用）

### 推奨対応
- `alert()`を削除し、統一的なエラー表示コンポーネントを使用
- エラーハンドリングパターンを統一

---

## 5. Exportの一貫性の欠如（重大度: 低）

### 問題
コンポーネントのexport方法が統一されていない：
- `default export`を使用: `BlockModal`, `HomeroomModal`, `CourseEntry`など
- `named export`を使用: `CourseModal`など

### 影響範囲
- `src/app/(private)/curriculum/components/`配下の複数コンポーネント

### 推奨対応
プロジェクト全体で`named export`に統一するか、`default export`に統一する。

---

## 6. TODOコメントの残存（重大度: 低）

### 問題
実装が未完了のTODOコメントが残っている。

### 影響範囲
- `src/app/api/optimize/service.ts` - 1箇所（ユーザー情報の取得）
- `src/app/(private)/constraints/components/ConstraintDefinitionModal/actions/actions.ts` - 2箇所（ユーザーIDの取得）
- `src/lib/graphql-client.ts` - 1箇所（認証されたユーザーからの取得）

### 推奨対応
TODOコメントを解決するか、適切な実装を追加する。

---

## 7. コンポーネント内での型定義（重大度: 低）

### 問題
`CurriculumUi.tsx`内で`BlockModalContext`型がコンポーネント内に定義されている。

### 影響範囲
- `src/app/(private)/curriculum/CurriculumUi.tsx` (69-80行目)

### 推奨対応
型定義を適切な場所（`@/types/ui-types.ts`など）に移動する。

---

## 8. ネイティブconfirmの使用（重大度: 低）

### 問題
`window.confirm()`を使用しており、UIの一貫性が損なわれる可能性がある。

### 影響範囲
- `src/app/(private)/curriculum/components/BlockModal/BlockModal.tsx` - 1箇所
- `src/app/(private)/curriculum/components/HomeroomModal/HomeroomModal.tsx` - 1箇所（`confirm`使用）

### 推奨対応
統一的な確認ダイアログコンポーネントを作成し、使用する。

---

## 優先度別の対応推奨順序

### 高優先度
1. **ロギングの直接使用** - ルール違反であり、本番環境での問題につながる可能性
2. **型安全性の欠如** - ランタイムエラーの原因となる可能性

### 中優先度
3. **巨大なコンポーネント** - 保守性とテスタビリティに影響
4. **エラーハンドリングの一貫性** - UXの一貫性に影響

### 低優先度
5. **Exportの一貫性** - コードの可読性に軽微な影響
6. **TODOコメント** - 機能的な問題ではないが、技術的負債
7. **コンポーネント内での型定義** - コードの整理
8. **ネイティブconfirmの使用** - UXの一貫性に軽微な影響
