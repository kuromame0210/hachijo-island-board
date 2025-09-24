/**
 * 投稿機能の超シンプルなテスト
 */

// 投稿データの型
interface Post {
  id?: number
  title: string
  description: string
  category: '不動産' | '仕事' | '不用品'
  price?: number | null
  images?: string[]
  created_at?: string
}

// テスト用のシンプルな投稿管理クラス
class PostManager {
  private posts: Post[] = []
  private nextId = 1

  // 投稿作成
  createPost(postData: Omit<Post, 'id' | 'created_at'>): Post {
    if (!postData.title || !postData.description || !postData.category) {
      throw new Error('必須項目が不足しています')
    }

    const post: Post = {
      id: this.nextId++,
      ...postData,
      created_at: new Date().toISOString()
    }

    this.posts.push(post)
    return post
  }

  // 投稿取得
  getPost(id: number): Post | null {
    return this.posts.find(post => post.id === id) || null
  }

  // 投稿一覧取得
  getPosts(): Post[] {
    return [...this.posts]
  }

  // 投稿削除
  deletePost(id: number): boolean {
    const index = this.posts.findIndex(post => post.id === id)
    if (index === -1) return false

    this.posts.splice(index, 1)
    return true
  }

  // 投稿数取得
  getPostCount(): number {
    return this.posts.length
  }
}

describe('投稿機能テスト', () => {
  let postManager: PostManager

  beforeEach(() => {
    postManager = new PostManager()
  })

  describe('投稿作成', () => {
    it('正常な投稿が作成できる', () => {
      const postData = {
        title: 'テスト投稿',
        description: 'これはテスト投稿です',
        category: '不動産' as const,
        price: 100000
      }

      const post = postManager.createPost(postData)

      expect(post.id).toBeDefined()
      expect(post.title).toBe('テスト投稿')
      expect(post.category).toBe('不動産')
      expect(post.price).toBe(100000)
      expect(post.created_at).toBeDefined()
    })

    it('必須項目なしでエラーになる', () => {
      const invalidData = {
        title: '',
        description: 'テスト',
        category: '不動産' as const
      }

      expect(() => postManager.createPost(invalidData)).toThrow('必須項目が不足しています')
    })

    it('画像付き投稿が作成できる', () => {
      const postData = {
        title: 'テスト投稿',
        description: 'これはテスト投稿です',
        category: '不用品' as const,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      }

      const post = postManager.createPost(postData)

      expect(post.images).toHaveLength(2)
      expect(post.images![0]).toBe('https://example.com/image1.jpg')
    })
  })

  describe('投稿取得', () => {
    it('投稿IDで取得できる', () => {
      const postData = {
        title: 'テスト投稿',
        description: 'テスト説明',
        category: '仕事' as const
      }

      const created = postManager.createPost(postData)
      const found = postManager.getPost(created.id!)

      expect(found).not.toBeNull()
      expect(found!.title).toBe('テスト投稿')
    })

    it('存在しないIDで null が返る', () => {
      const found = postManager.getPost(999)
      expect(found).toBeNull()
    })

    it('投稿一覧が取得できる', () => {
      postManager.createPost({
        title: '投稿1',
        description: '説明1',
        category: '不動産'
      })

      postManager.createPost({
        title: '投稿2',
        description: '説明2',
        category: '仕事'
      })

      const posts = postManager.getPosts()
      expect(posts).toHaveLength(2)
      expect(posts[0].title).toBe('投稿1')
      expect(posts[1].title).toBe('投稿2')
    })
  })

  describe('投稿削除', () => {
    it('投稿が削除できる', () => {
      const post = postManager.createPost({
        title: 'テスト投稿',
        description: 'テスト説明',
        category: '不用品'
      })

      expect(postManager.getPostCount()).toBe(1)

      const deleted = postManager.deletePost(post.id!)
      expect(deleted).toBe(true)
      expect(postManager.getPostCount()).toBe(0)

      const found = postManager.getPost(post.id!)
      expect(found).toBeNull()
    })

    it('存在しない投稿の削除は false を返す', () => {
      const deleted = postManager.deletePost(999)
      expect(deleted).toBe(false)
    })

    it('複数投稿から特定の投稿だけ削除できる', () => {
      const post1 = postManager.createPost({
        title: '投稿1',
        description: '説明1',
        category: '不動産'
      })

      const post2 = postManager.createPost({
        title: '投稿2',
        description: '説明2',
        category: '仕事'
      })

      expect(postManager.getPostCount()).toBe(2)

      postManager.deletePost(post1.id!)
      expect(postManager.getPostCount()).toBe(1)

      const remaining = postManager.getPost(post2.id!)
      expect(remaining!.title).toBe('投稿2')
    })
  })

  describe('カテゴリ検証', () => {
    it.each(['不動産', '仕事', '不用品'])('カテゴリ "%s" で投稿できる', (category) => {
      const post = postManager.createPost({
        title: 'テスト',
        description: 'テスト',
        category: category as '不動産' | '仕事' | '不用品'
      })

      expect(post.category).toBe(category)
    })
  })

  describe('価格検証', () => {
    it('価格なし（null）で投稿できる', () => {
      const post = postManager.createPost({
        title: 'テスト',
        description: 'テスト',
        category: '不用品',
        price: null
      })

      expect(post.price).toBeNull()
    })

    it('価格0で投稿できる', () => {
      const post = postManager.createPost({
        title: 'テスト',
        description: 'テスト',
        category: '不用品',
        price: 0
      })

      expect(post.price).toBe(0)
    })
  })
})