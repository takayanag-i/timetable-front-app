# CourseModalとConstraintDefinitionModalの比較分析

## 概要

このドキュメントでは、`CourseModal`と`ConstraintDefinitionModal`の2つのモーダルコンポーネントの共通点と相違点を分析します。両モーダルは似たような動作を持ちますが、実装の思想に違いがあります。

## 1. 共通点

### 1.1 基本構造

両モーダルとも以下の共通構造を持っています：

- **モーダルコンポーネント**: 新規作成と編集を統合管理
- **Registerコンポーネント**: 新規作成用のフォーム
- **Editコンポーネント**: 編集用のフォーム
- **Server Actions**: データの作成、更新、削除を処理

```
CourseModal
├── CourseModal.tsx (親コンポーネント)
├── components/
│   ├── CourseRegister.tsx (新規作成)
│   └── CourseEdit.tsx (編集)
└── actions/actions.ts (Server Actions)

ConstraintDefinitionModal
├── ConstraintDefinitionModal.tsx (親コンポーネント)
├── components/
│   ├── ConstraintDefinitionRegister.tsx (新規作成)
│   └── ConstraintDefinitionEdit.tsx (編集)
└── actions/actions.ts (Server Actions)
```

### 1.2 状態管理

両モーダルとも以下の共通パターンを使用：

- **React Hook Form**: フォーム状態管理
- **useActionState**: Server Actionsとの統合
- **useEffect**: モーダルの開閉時の初期化
- **useRef**: コールバック関数の安定化

### 1.3 フォーム送信パターン

両モーダルとも以下の共通フローを実装：

1. フォームバリデーション
2. Server Actionの実行（useActionState）
3. 成功時のコールバック実行
4. エラーハンドリング
5. フォームのリセット

### 1.4 編集モードの機能

両モーダルとも編集モードで以下を提供：

- 既存データの表示と編集
- 更新機能
- 削除機能（独立したフォーム）

## 2. 相違点

### 2.1 モード切り替えの実装思想

#### CourseModal: **ラジオボタンによる動的切り替え**

```typescript
// 編集モードで2つの選択肢を提供
const [editType, setEditType] = useState<'current' | 'change'>('current')

// ラジオボタンで選択
<label className={styles.radioLabel}>
  <input type="radio" value="current" checked={editType === 'current'} />
  <span>現在の講座を編集</span>
</label>
<label className={styles.radioLabel}>
  <input type="radio" value="change" checked={editType === 'change'} />
  <span>講座を変更</span>
</label>

// 選択に応じてコンポーネントを切り替え
{editType === 'current' ? (
  <CourseEdit ... />
) : (
  <CourseRegister ... />
)}
```

**特徴:**

- 編集時に「現在の講座を編集」と「講座を変更」の2つの操作を選択可能
- モーダル内で動的に表示コンポーネントを切り替え
- より柔軟なユーザー体験を提供

#### ConstraintDefinitionModal: **プロパティベースの静的切り替え**

```typescript
// modeプロパティで決定
interface ConstraintDefinitionModalProps {
  mode: 'create' | 'edit'
  // ...
}

// 条件分岐で表示を決定
if (mode === 'edit' && constraintDefinitionId) {
  return <Modal><ConstraintDefinitionEdit ... /></Modal>
}
return <Modal><ConstraintDefinitionRegister ... /></Modal>
```

**特徴:**

- 親コンポーネントからmodeプロパティで決定
- モーダルを開く時点でモードが固定
- よりシンプルで予測可能な実装

### 2.2 編集時のフィールド制限

#### CourseModal

**CourseEdit（現在の講座を編集）:**

- 科目: **変更不可**（disabled）
- 講座名: **サジェストなし**の通常入力
- 担当教員: 変更可能

**CourseRegister（講座を変更）:**

- 科目: 変更可能
- 講座名: **サジェストあり**
- 担当教員: 変更可能

```typescript
// CourseEdit.tsx - 科目は固定
<input
  type="text"
  value={currentSubject?.subjectName || ''}
  disabled
  style={{ opacity: 0.6, cursor: 'not-allowed' }}
/>

// CourseEdit.tsx - 講座名は通常入力（サジェストなし）
<input
  id="courseName"
  type="text"
  value={courseNameValue}
  onChange={e => setValue('courseName', e.target.value)}
  placeholder="講座名を入力"
/>
```

#### ConstraintDefinitionModal

**ConstraintDefinitionEdit:**

- 制約定義コード: **変更不可**（disabled）
- ソフト制約フラグ: 変更可能
- 重み: 変更可能
- パラメータ: 変更可能

```typescript
// ConstraintDefinitionEdit.tsx - 制約定義コードは固定
<input
  type="text"
  value={constraintDefinitionMasters.find(...)?.constraintDefinitionName}
  disabled
  style={{ opacity: 0.6, cursor: 'not-allowed' }}
/>
```

### 2.3 フィールドの複雑さ

#### CourseModal: **動的フィールド配列**

```typescript
// useFieldArrayを使用して担当教員を動的管理
const { fields, append, remove, replace } = useFieldArray({
  control,
  name: 'courseDetails',
})

// 複数教員の追加・削除
<button onClick={addInstructorField}>＋</button>
<button onClick={() => removeInstructorField(index)}>削除</button>
```

**特徴:**

- 担当教員を動的に追加・削除可能
- カスタムフックで複雑なロジックを分離（`useInstructorFields`）
- 重複選択を防ぐフィルタリング機能

#### ConstraintDefinitionModal: **動的パラメータ生成**

```typescript
// マスタデータから動的にパラメータフィールドを生成
{selectedParameterMasters.map(paramMaster => {
  const isArray = paramMaster.arrayFlag
  const optionList = paramMaster.optionList

  return (
    <div key={paramMaster.parameterKey}>
      {optionList ? (
        <select multiple={isArray}>...</select>
      ) : (
        <input type="text" />
      )}
    </div>
  )
})}
```

**特徴:**

- マスタデータから自動的にフィールドを生成
- 配列型パラメータのサポート
- JSON形式での保存

### 2.4 オプションデータの管理

#### CourseModal: **複合データ取得**

```typescript
// 1回のGraphQLリクエストで全データを取得
interface CourseModalOptions {
  subjects: Subject[]
  instructors: Instructor[]
  courses: Course[] // 既存講座一覧
}

// サジェスト機能のために既存講座データも取得
const { coursesInSelectedSubject, suggestedCourses } = useCourseSuggestions({
  subjectId,
  courses: courseOptions,
  courseName,
})
```

#### ConstraintDefinitionModal: **マスタ駆動型**

```typescript
interface ConstraintDefinitionModalProps {
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
}

// マスタデータから動的にUI生成
const selectedParameterMasters =
  constraintDefinitionMasters.find(
    m => m.constraintDefinitionCode === constraintDefinitionCodeValue
  )?.parameterMasters || []
```

### 2.5 サジェスト機能

#### CourseModal: **高度なサジェスト機能**

```typescript
// CourseRegisterのみサジェスト機能あり
<CourseNameFieldContainer
  coursesInSelectedSubject={coursesInSelectedSubject}
  suggestedCourses={suggestedCourses}
  onSelectExistingCourse={handleSelectExistingCourse}
/>

// 選択された講座から教員情報も自動設定
const handleSelectExistingCourse = (course) => {
  setSelectedCourseId(course.id)
  setValue('courseName', course.courseName)
  replace(course.instructorIds.map(id => ({ instructorId: id })))
}
```

#### ConstraintDefinitionModal: **サジェスト機能なし**

- シンプルなselect要素のみ
- 既存データの再利用機能なし

### 2.6 削除機能の実装

#### CourseModal: **レーンから削除**

```typescript
// removeCourseFromLane - レーンの講座リストから削除
// 講座エンティティ自体は削除しない
<form action={removeAction}>
  <input type="hidden" name="laneId" value={laneId} />
  <input type="hidden" name="courseId" value={courseId} />
  <button type="submit">レーンから削除</button>
</form>
```

**特徴:**

- レーンとの関連を削除（ソフト削除）
- 講座データは保持される

#### ConstraintDefinitionModal: **エンティティ削除**

```typescript
// deleteConstraintDefinition - 制約定義を完全削除
<form action={deleteAction}>
  <input type="hidden" name="id" value={constraintDefinitionId} />
  <button type="submit">削除</button>
</form>
```

**特徴:**

- エンティティを完全削除（ハード削除）
- データベースから削除される

### 2.7 ビジネスロジックの複雑さ

#### CourseModal: **複雑な関連性**

```typescript
// 科目に基づいて教員をフィルタリング
const { availableInstructors } = useFilteredInstructors({
  subjectId,
  subjects: filteredSubjects,
  instructors: instructorOptions,
})

// 学年による科目フィルタリング
const filteredSubjects = useMemo(() => {
  if (!gradeId) return subjectOptions
  return subjectOptions.filter(subject => subject.grade?.id === gradeId)
}, [subjectOptions, gradeId])

// 既存講座との名前重複チェック
const exactMatchCourse = coursesInSelectedSubject.find(
  course => course.courseName.toLowerCase() === trimmedCourseName.toLowerCase()
)
```

#### ConstraintDefinitionModal: **マスタ駆動型のシンプルさ**

```typescript
// 制約定義コードからsoftFlagを自動設定
const selectedMaster = constraintDefinitionMasters.find(
  m => m.constraintDefinitionCode === e.target.value
)
if (selectedMaster) {
  setValue('softFlag', selectedMaster.softFlag)
}

// 既存ソフト制約の表示
const existingSoftConstraints = existingConstraintDefinitions.filter(
  cd =>
    cd.constraintDefinitionCode === constraintDefinitionCodeValue &&
    cd.softFlag === true
)
```

## 3. カスタムフックの利用

### CourseModal

複雑なロジックを複数のカスタムフックに分離：

- `useCourseSuggestions`: 講座サジェストロジック
- `useFilteredInstructors`: 教員フィルタリング
- `useInstructorFields`: 教員フィールド管理

### ConstraintDefinitionModal

カスタムフックなし、React Hook Formのみ使用

## 4. UIコンポーネントの使用

### CourseModal

- カスタムフィールドコンポーネント
  - `SubjectSelectField`
  - `InstructorSelectField`
  - `CourseNameFieldContainer`
  - `CourseNameField`

### ConstraintDefinitionModal

- Radix UI
  - `@radix-ui/react-slider`: スライダーコンポーネント
- 標準HTML要素のみ

## 5. 設計思想の違い

### CourseModal: **ユーザー中心の柔軟性**

- 編集時に複数の操作方法を提供
- 高度なサジェスト機能で既存データの再利用を促進
- 複雑な関連性とビジネスルールを実装
- ソフト削除でデータを保護

### ConstraintDefinitionModal: **マスタ駆動のシンプルさ**

- モードは親から決定、シンプルな切り替え
- マスタデータからUIを自動生成
- パラメータの柔軟性（動的フィールド生成）
- ハード削除でデータ整合性を維持

## 6. まとめ

### CourseModalの特徴

**強み:**

- 柔軟なユーザー体験（編集時の選択肢）
- 既存データの再利用促進
- 複雑な関連性の適切な管理

**複雑さ:**

- 多数のカスタムフック
- 動的フィールド管理
- サジェスト機能の実装

### ConstraintDefinitionModalの特徴

**強み:**

- シンプルで予測可能な実装
- マスタ駆動型で拡張性が高い
- パラメータの柔軟性

**シンプルさ:**

- カスタムフック不要
- 標準的なReact Hook Form使用
- マスタデータから自動生成

### 推奨される使い分け

- **CourseModal型**:
  - ユーザーが複数の操作方法を必要とする場合
  - 既存データの再利用が重要な場合
  - 複雑な関連性やビジネスルールがある場合

- **ConstraintDefinitionModal型**:
  - シンプルで予測可能な動作が望ましい場合
  - マスタデータから動的にUIを生成したい場合
  - フィールド構造が変更される可能性がある場合

両モーダルとも、それぞれのユースケースに適した設計思想を持っており、どちらが優れているというわけではなく、要件に応じて適切な実装パターンを選択することが重要です。
