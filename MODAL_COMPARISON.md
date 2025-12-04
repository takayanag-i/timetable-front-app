# CourseModal と ConstraintDefinitionModal の実装比較

## 概要

CourseModal（講座モーダル）と ConstraintDefinitionModal（制約定義モーダル）は、どちらもデータの新規作成と編集を行うモーダルコンポーネントですが、実装の思想に重要な違いがあります。

---

## 共通点

### 1. 基本的な機能構成
両モーダルとも以下の機能を持っています：

- **新規作成機能**: 新しいレコードの作成
- **編集機能**: 既存レコードの更新
- **削除機能**: 既存レコードの削除（編集モード時）
- **モーダルUI**: 共通の Modal コンポーネント（@/components/shared/Modal）を使用

### 2. ディレクトリ構造
どちらも同様のディレクトリ構造を採用しています：

```
Modal/
├── [Modal名].tsx               # メインモーダルコンポーネント
├── [Modal名].module.css        # スタイル定義
├── actions/                    # サーバーアクション
│   ├── actions.ts
│   └── index.ts
├── components/                 # UIコンポーネント
│   └── [個別コンポーネント].tsx
└── hooks/                      # カスタムフック
    └── [個別フック].ts
```

### 3. Server Actions の活用
両方とも Next.js の Server Actions を使用してデータ操作を実行：

- CRUD操作（作成・読取・更新・削除）
- `useActionState` フックによる非同期処理
- `revalidatePath` によるキャッシュ再検証

### 4. React Hook Form の使用
フォーム管理に React Hook Form を活用：

- `useForm` による状態管理
- `watch` による値の監視
- `setValue` による値の設定
- `reset` によるフォームリセット

### 5. カスタムフックによるロジック分離
ビジネスロジックをカスタムフックに分離して再利用性を向上

### 6. エラーハンドリング
統一されたエラーハンドリング機構：

- `ActionResult` 型による統一的なレスポンス形式
- エラーメッセージの表示
- ローディング状態の管理

---

## 相違点

### 1. **モード管理の思想**

#### CourseModal: 状態ベースのモード切り替え
```tsx
interface CourseModalProps {
  editMode?: boolean           // true なら編集モード
  // 編集モード時の追加選択肢
  const [editType, setEditType] = useState<'current' | 'change'>('current')
}
```

**特徴:**
- 編集モード内で更に「現在の講座を編集」と「講座を変更」の2つのサブモードを持つ
- **内部状態** (`editType`) でUIを動的に切り替え
- ユーザーがラジオボタンでモードを選択できる
- **1つのモーダルで3つの操作**: 新規作成、現在の編集、講座変更

#### ConstraintDefinitionModal: プロップベースのモード指定
```tsx
interface ConstraintDefinitionModalProps {
  mode: 'create' | 'edit'      // 明示的なモード指定
}
```

**特徴:**
- モードが **外部から明示的に指定** される
- 内部でのモード切り替えは行わない
- **1つのモーダルで2つの操作**: 新規作成、編集
- よりシンプルで予測可能な動作

---

### 2. **コンポーネント構造の違い**

#### CourseModal: 機能別コンポーネント分離
```
CourseModal/
├── CourseModal.tsx              # メインモーダル（条件分岐あり）
├── components/
│   ├── CourseEdit.tsx           # 編集専用コンポーネント
│   ├── CourseRegister.tsx       # 登録・変更用コンポーネント
│   ├── SubjectSelectField.tsx   # 科目選択フィールド
│   ├── InstructorSelectField.tsx # 教員選択フィールド
│   ├── CourseNameField.tsx
│   └── CourseNameFieldContainer.tsx
```

**思想:**
- 編集と登録で **異なるコンポーネント** (CourseEdit / CourseRegister) を使用
- 各コンポーネントが独立したフォームロジックを持つ
- それぞれが独自の Server Actions を呼び出す

**メリット:**
- 編集と登録で異なる UI/UX を提供できる（例: 科目選択の可否）
- 各モードが完全に独立しているため、個別最適化が可能

**デメリット:**
- コードの重複が発生しやすい
- 同じようなロジックが複数箇所に存在

#### ConstraintDefinitionModal: 共通フォームの再利用
```
ConstraintDefinitionModal/
├── ConstraintDefinitionModal.tsx # シンプルなラッパー
├── components/
│   ├── ConstraintDefinitionForm.tsx  # 共通フォーム（create/edit兼用）
│   ├── ConstraintSelectField.tsx
│   ├── SoftConstraintCheckbox.tsx
│   ├── PenaltyWeightSlider.tsx
│   └── ParametersField.tsx
```

**思想:**
- 新規作成と編集で **同じフォームコンポーネント** (ConstraintDefinitionForm) を使用
- `mode` プロップで動作を切り替え
- DRY原則を厳密に適用

**メリット:**
- コードの重複が最小限
- 変更が必要な場合、1箇所を修正すれば良い
- 保守性が高い

**デメリット:**
- 複雑な条件分岐が必要になる場合がある
- モード間で大きく異なる動作を実装しにくい

---

### 3. **フォーム処理の違い**

#### CourseModal: コンポーネント内でフォーム完結

**CourseEdit.tsx:**
```tsx
export function CourseEdit({ ... }: CourseEditProps) {
  const { control, watch, setValue, reset } = useForm<CourseFormValues>({...})
  const [updateResult, updateAction, isUpdating] = useActionState(updateCourse, null)
  const [removeResult, removeAction, isRemoving] = useActionState(removeCourseFromLane, null)
  
  // フォーム処理とアクション処理が同じコンポーネント内
  return (
    <form action={updateAction}>...</form>
  )
}
```

**CourseRegister.tsx:**
```tsx
export function CourseRegister({ ... }: CourseRegisterProps) {
  const { control, watch, setValue, reset } = useForm<CourseFormValues>({...})
  const [createResult, createAction, isCreating] = useActionState(createCourseAndAddToLane, null)
  
  return (
    <form action={createAction}>...</form>
  )
}
```

**特徴:**
- 各コンポーネントが自己完結している
- フォーム状態とアクションが同じファイルに存在

#### ConstraintDefinitionModal: フック層での分離

**ConstraintDefinitionForm.tsx:**
```tsx
export function ConstraintDefinitionForm({
  mode,
  ...
}: ConstraintDefinitionFormProps) {
  // フォーム状態管理を専用フックに委譲
  const {
    setValue,
    resetFormState,
    isFormValid,
    ...
  } = useConstraintDefinitionForm({...})

  // アクション管理を専用フックに委譲
  const { error, isPending, createAction, updateAction, deleteAction } =
    useConstraintDefinitionActions({ mode, ... })

  // mode に応じて適切なアクションを選択
  const submitAction = isEditMode ? updateAction : createAction

  return (
    <form action={submitAction}>...</form>
  )
}
```

**特徴:**
- フォーム管理とアクション管理を **カスタムフック** に分離
- コンポーネントは UI レンダリングに専念
- より高度な関心の分離

---

### 4. **カスタムフックの設計**

#### CourseModal のフック
```
hooks/
├── useCourseSuggestions.ts      # 講座サジェスト機能
├── useFilteredInstructors.ts    # 教員フィルタリング
└── useInstructorFields.ts       # 教員フィールド操作
```

**特徴:**
- **ドメイン固有のビジネスロジック** に特化
- UI機能をサポートするための補助的なフック
- フォーム全体の管理は各コンポーネント内で実施

#### ConstraintDefinitionModal のフック
```
hooks/
├── useConstraintDefinitionForm.ts     # フォーム状態管理（汎用）
└── useConstraintDefinitionActions.ts  # サーバーアクション管理（汎用）
```

**特徴:**
- **フォームとアクションの管理** に特化
- 再利用可能な汎用的な設計
- コンポーネントからロジックを完全に分離

---

### 5. **編集時の動作の違い**

#### CourseModal: 柔軟な編集オプション

**編集モード時の選択肢:**
1. **現在の講座を編集**: 講座名や担当教員を変更（科目は変更不可）
2. **講座を変更**: 完全に別の講座に差し替え（実質的には削除＋追加）

```tsx
{editType === 'current' ? (
  <CourseEdit ... />  // 既存講座の更新
) : (
  <CourseRegister ... />  // 別の講座への変更
)}
```

**ユースケース:**
- 時間割における講座配置は頻繁に変更される
- 「ちょっと修正」と「完全に別の講座に変更」の2つのニーズがある

#### ConstraintDefinitionModal: シンプルな編集

**編集モード時:**
- 既存の制約定義を更新するのみ
- モード切り替えは不要

```tsx
const submitAction = isEditMode ? updateAction : createAction
```

**ユースケース:**
- 制約定義は一度作成されたら大幅な変更は少ない
- 単純な編集操作で十分

---

### 6. **データフェッチ戦略**

#### CourseModal
```tsx
// 1回のGraphQLリクエストで全データ取得
export async function fetchCourseModalOptions() {
  const result = await executeGraphQLForServerAction<CourseModalOptionsResponse>({
    query: GET_COURSE_MODAL_OPTIONS,  // 科目・教員・講座を一括取得
    variables: { ttid, coursesInput: { ttid } },
  })
  
  return successResult({
    subjects,
    instructors,
    courses: normalizedCourses,
  })
}
```

**特徴:**
- **一括フェッチ**: パフォーマンス最適化
- 複数のデータソースを1回のリクエストで取得
- レスポンスの正規化処理が含まれる

#### ConstraintDefinitionModal
```tsx
// 必要に応じて個別にフェッチ
export async function fetchConstraintDefinition(formData: FormData) {
  const id = formData.get('id') as string
  
  const result = await executeGraphQLForServerAction<ConstraintDefinition[]>({
    query: GET_CONSTRAINT_DEFINITIONS,
    variables: { input: { ttid, id } },
  })
  
  return successResult(constraintDefinition)
}
```

**特徴:**
- **個別フェッチ**: 必要なデータのみ取得
- シンプルで理解しやすい

---

### 7. **複雑なフィールド処理**

#### CourseModal: 動的な教員フィールド

```tsx
const { fields, append, remove, replace } = useFieldArray({
  control,
  name: 'courseDetails',
})

// 教員を複数追加・削除できる
const { addInstructorField, removeInstructorField, updateInstructorField } =
  useInstructorFields({ courseDetailsValue, append, remove, replace, setValue })
```

**特徴:**
- `useFieldArray` による動的フィールド管理
- 担当教員を複数追加・削除できる
- 重複選択の防止ロジック

#### ConstraintDefinitionModal: 動的パラメータフィールド

```tsx
// パラメータは制約定義コードに応じて動的に変化
const selectedParameterMasters = useMemo<ConstraintParameterMasterResponse[]>(
  () =>
    constraintDefinitionMasters.find(
      m => m.constraintDefinitionCode === constraintDefinitionCodeValue
    )?.parameterMasters || [],
  [constraintDefinitionMasters, constraintDefinitionCodeValue]
)
```

**特徴:**
- 選択された制約定義に応じてパラメータフィールドが変化
- JSONとしてパラメータを管理

---

### 8. **バリデーション戦略**

#### CourseModal
```tsx
const hasInstructor = 
  courseDetailsValue.length > 0 && 
  courseDetailsValue.every(detail => !!detail.instructorId)
const isFormValid = !!subjectIdValue && !!courseNameValue && hasInstructor

// 講座名の重複チェック
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  const exactMatchCourse = coursesInSelectedSubject.find(
    course => course.courseName.toLowerCase() === trimmedCourseName.toLowerCase()
  )
  
  if (exactMatchCourse && !selectedCourseId) {
    e.preventDefault()
    setError('同名の講座が既に存在します。サジェストから選択してください。')
  }
}
```

**特徴:**
- カスタムバリデーションロジック
- 講座名の重複をサジェストで解決
- より複雑なビジネスルール

#### ConstraintDefinitionModal
```tsx
const isFormValid =
  !!constraintDefinitionCodeValue &&
  (softFlagValue ? !!penaltyWeightValue : true)
```

**特徴:**
- シンプルな必須チェック
- 条件付きバリデーション（ソフト制約の場合のみ重みが必要）

---

## 実装の思想の違い

### CourseModal の思想: **柔軟性と機能の多様性**

1. **ユーザー中心の設計**
   - 編集時にユーザーが「修正」か「変更」かを選べる
   - より多くの選択肢を提供

2. **コンポーネントの独立性**
   - 各モードが独立したコンポーネント
   - 個別最適化が容易

3. **ビジネスロジックの重視**
   - 複雑なサジェスト機能
   - 重複チェック
   - 動的な教員フィールド

4. **パフォーマンス重視**
   - データの一括取得
   - レスポンスの正規化

**適用場面:**
- 複雑なビジネスロジックが必要
- モードによって UI/UX が大きく異なる
- 高度な入力支援機能が必要

---

### ConstraintDefinitionModal の思想: **保守性とコードの再利用**

1. **DRY原則の厳密な適用**
   - 共通フォームの再利用
   - 重複コードの排除

2. **関心の分離**
   - フォーム管理を `useConstraintDefinitionForm` に分離
   - アクション管理を `useConstraintDefinitionActions` に分離
   - UIコンポーネントは表示に専念

3. **予測可能な動作**
   - 外部からのモード指定
   - 内部状態の変更が少ない

4. **保守性の重視**
   - 変更箇所が1箇所に集約
   - テストが容易

**適用場面:**
- モード間でロジックが類似している
- 保守性を最優先にしたい
- シンプルな CRUD 操作

---

## どちらの思想を採用すべきか？

### CourseModal 型の実装が適しているケース

✅ 編集と作成で UI/UX が大きく異なる
✅ 複雑なビジネスロジックが必要
✅ 高度な入力支援機能（サジェスト、自動補完など）が必要
✅ パフォーマンスが重要（一括データ取得）
✅ 各モードを独立して最適化したい

### ConstraintDefinitionModal 型の実装が適しているケース

✅ 編集と作成でロジックがほぼ同じ
✅ シンプルな CRUD 操作
✅ 保守性とコードの再利用を重視
✅ チームでの開発で一貫性を保ちたい
✅ テストのしやすさを重視

---

## リファクタリングの方向性

### CourseModal を ConstraintDefinitionModal 型にリファクタリングする場合

**メリット:**
- コードの重複を削減
- 保守性の向上
- テストの容易性

**デメリット:**
- 編集時の「現在の講座を編集」と「講座を変更」の分離が難しい
- 既存の UI/UX が変わる可能性
- ビジネスロジックの複雑さが増す

**推奨:**
現状の CourseModal は、ユーザーに選択肢を提供する設計が重要な役割を果たしているため、無理に共通化する必要はない。ただし、`CourseEdit` と `CourseRegister` の重複部分（教員選択など）は共通化できる可能性がある。

### ConstraintDefinitionModal を CourseModal 型にリファクタリングする場合

**メリット:**
- 各モードの独立性が増す
- 個別最適化が可能

**デメリット:**
- コードの重複が増加
- 保守性が低下
- せっかくのリファクタリングが無駄になる

**推奨:**
ConstraintDefinitionModal は既に最適な設計になっているため、リファクタリング不要。この設計を他のシンプルなモーダルにも適用すべき。

---

## 結論

**CourseModal** と **ConstraintDefinitionModal** は、どちらも適切な設計思想に基づいて実装されています：

- **CourseModal**: 複雑なビジネス要件に対応するため、柔軟性と機能性を重視
- **ConstraintDefinitionModal**: シンプルな CRUD に対して、保守性とコードの再利用性を重視

重要なのは、**それぞれのユースケースに応じて適切な設計を選択すること** です。無理に統一する必要はなく、プロジェクト全体として両方のパターンを理解し、適材適所で使い分けることが推奨されます。

---

## 参考資料

- [ConstraintDefinitionModal README](./src/app/(private)/constraints/components/ConstraintDefinitionModal/README.md)
- CourseModal: `src/app/(private)/curriculum/components/CourseModal/`
- ConstraintDefinitionModal: `src/app/(private)/constraints/components/ConstraintDefinitionModal/`
