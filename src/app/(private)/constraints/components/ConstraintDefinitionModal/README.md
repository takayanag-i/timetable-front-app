# 制約定義モーダル (ConstraintDefinitionModal)

## 概要

制約定義の新規作成と編集を行うモーダルコンポーネントです。
リファクタリングにより、Register（新規作成）とEdit（編集）で共通のロジックとUIコンポーネントを共有しています。

## ディレクトリ構成

```
ConstraintDefinitionModal/
├── ConstraintDefinitionModal.tsx          # メインモーダルコンポーネント
├── ConstraintDefinitionModal.module.css  # スタイル定義
├── actions/                               # サーバーアクション
│   ├── actions.ts                         # CRUD操作の実装
│   └── index.ts                           # エクスポート
├── components/                            # UIコンポーネント
│   ├── ConstraintDefinitionForm.tsx       # 共通フォームコンポーネント
│   ├── ConstraintSelectField.tsx          # 制約選択フィールド
│   ├── SoftConstraintCheckbox.tsx         # ソフト制約チェックボックス
│   ├── PenaltyWeightSlider.tsx            # 重みスライダー
│   └── ParametersField.tsx                # パラメータフィールド
└── hooks/                                 # カスタムフック
    ├── useConstraintDefinitionForm.ts     # フォーム状態管理
    └── useConstraintDefinitionActions.ts  # サーバーアクション管理
```

## 主要コンポーネント

### 1. ConstraintDefinitionModal.tsx
モーダルのエントリーポイント。モード（create/edit）に応じて適切なコンポーネントを表示します。

### 2. ConstraintDefinitionForm.tsx（共通フォーム）
新規作成と編集で共通のフォームロジックを提供します。
`ConstraintDefinitionModal.tsx` から直接使用されます。

**Props:**
- `mode`: 'create' | 'edit' - 動作モード
- `isOpen`: boolean - モーダルの開閉状態
- `onClose`: () => void - 閉じる時のコールバック
- `onSuccess`: () => void - 成功時のコールバック
- `constraintDefinitionId`: string (編集モードのみ) - 編集対象のID
- `constraintDefinitionMasters`: ConstraintDefinitionMasterResponse[] - マスタデータ
- `existingConstraintDefinitions`: ConstraintDefinition[] - 既存の制約定義
- `initialValues`: ConstraintDefinitionFormValues - 初期値

## カスタムフック

### useConstraintDefinitionForm
フォームの状態管理を担当します。

**返り値:**
- `setValue`: フォーム値の設定
- `resetFormState`: フォームのリセット
- `errors`: バリデーションエラー
- `constraintDefinitionCodeValue`: 制約定義コード
- `softFlagValue`: ソフト制約フラグ
- `penaltyWeightValue`: ペナルティ重み
- `parametersValue`: パラメータJSON文字列
- `selectedParameterMasters`: 選択された制約のパラメータマスタ
- `existingSoftConstraints`: 既存のソフト制約
- `isFormValid`: フォームの妥当性

### useConstraintDefinitionActions
サーバーアクションとエラー処理を管理します。

**返り値:**
- `error`: エラーメッセージ
- `isPending`: 処理中フラグ
- `createAction`: 新規作成アクション（createモードのみ）
- `updateAction`: 更新アクション（editモードのみ）
- `deleteAction`: 削除アクション（editモードのみ）

## 共通UIコンポーネント

### ConstraintSelectField
制約の選択フィールド。編集モードでは読み取り専用で表示されます。

### SoftConstraintCheckbox
ソフト制約のオン/オフを切り替えるチェックボックス。

### PenaltyWeightSlider
ソフト制約の重みを0.00～1.00の範囲で設定するスライダー。
既存のソフト制約がある場合は、その重みも表示されます。

### ParametersField
制約定義に応じた動的なパラメータフィールド。
- 配列型パラメータ：カンマ区切りで入力
- 選択肢付きパラメータ：selectで選択
- 通常パラメータ：テキスト入力

## フォームの流れ

1. **モーダルを開く**: `isOpen=true`
2. **初期値リセット**: useEffectで`resetFormState()`が実行される
3. **フォーム入力**: ユーザーが各フィールドに入力
4. **サーバーアクション実行**: 
   - 新規作成: `createAction` が実行される
   - 編集: `updateAction` が実行される
   - 削除: `deleteAction` が実行される
5. **成功時処理**: 
   - フォームがリセットされる
   - `onSuccess` コールバックが呼ばれる
   - モーダルが閉じる

## バリデーション

- 制約定義コードは必須
- ソフト制約の場合、ペナルティ重みが必要
- パラメータは自動的にJSON形式に変換される

## リファクタリングの効果

### Before（リファクタリング前）
- `ConstraintDefinitionRegister.tsx`: 333行
- `ConstraintDefinitionEdit.tsx`: 369行
- 重複コードが多数存在

### After（リファクタリング後）
- `ConstraintDefinitionModal.tsx`: モーダル本体から直接フォームを使用
- 共通ロジックを以下に分離:
  - `ConstraintDefinitionForm.tsx`: 183行（共通フォーム）
  - `useConstraintDefinitionForm.ts`: 105行（状態管理）
  - `useConstraintDefinitionActions.ts`: 100行（アクション管理）
  - UIコンポーネント（components/）: 各20-120行

### メリット
1. **DRY原則の適用**: 重複コードを排除
2. **保守性の向上**: 変更が必要な場合、1箇所を修正すれば良い
3. **可読性の向上**: 各コンポーネントが単一の責任を持つ
4. **構造の簡潔性**: 不要なラッパーコンポーネントを削除
5. **テストの容易性**: 小さな単位でテスト可能
6. **再利用性**: 個別のコンポーネントを他の場所でも利用可能

## 使用例

```tsx
import ConstraintDefinitionModal from './ConstraintDefinitionModal'

// 新規作成
<ConstraintDefinitionModal
  isOpen={isOpen}
  mode="create"
  title="新規制約定義"
  constraintDefinitionMasters={masters}
  existingConstraintDefinitions={existing}
  initialValues={{
    constraintDefinitionCode: '',
    softFlag: false,
    penaltyWeight: '0.5',
    parameters: '{}',
  }}
  onSuccess={handleSuccess}
  onClose={handleClose}
/>

// 編集
<ConstraintDefinitionModal
  isOpen={isOpen}
  mode="edit"
  title="制約定義編集"
  constraintDefinitionId={selectedId}
  constraintDefinitionMasters={masters}
  existingConstraintDefinitions={existing}
  initialValues={currentValues}
  onSuccess={handleSuccess}
  onClose={handleClose}
/>
```

モーダル内部では `mode` プロップに応じて `ConstraintDefinitionForm` が適切に動作します。

## 技術スタック

- **React**: 18.x
- **React Hook Form**: フォーム管理
- **Next.js**: Server Actions for mutations
- **Radix UI**: スライダーコンポーネント
- **TypeScript**: 型安全性
