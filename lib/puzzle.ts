export interface PuzzleConfig {
  rows: number
  cols: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface PuzzlePiece {
  id: string
  pieceIndex: number
  currentX: number
  currentY: number
  targetX: number
  targetY: number
  isPlaced: boolean
  rotation: number
  imageData?: string
}

export function generatePuzzleConfig(difficulty: 'easy' | 'medium' | 'hard'): PuzzleConfig {
  switch (difficulty) {
    case 'easy':
      return { rows: 3, cols: 4, difficulty: 'easy' }
    case 'medium':
      return { rows: 4, cols: 6, difficulty: 'medium' }
    case 'hard':
      return { rows: 6, cols: 8, difficulty: 'hard' }
    default:
      return { rows: 3, cols: 4, difficulty: 'easy' }
  }
}

export function generatePuzzlePieces(config: PuzzleConfig): Omit<PuzzlePiece, 'id'>[] {
  const pieces: Omit<PuzzlePiece, 'id'>[] = []
  const totalPieces = config.rows * config.cols
  
  // Generate target positions (correct positions)
  for (let i = 0; i < totalPieces; i++) {
    const row = Math.floor(i / config.cols)
    const col = i % config.cols
    
    pieces.push({
      pieceIndex: i,
      currentX: Math.random() * 400 + 50, // Random starting position
      currentY: Math.random() * 300 + 50,
      targetX: col * 100 + 50, // Target position
      targetY: row * 100 + 50,
      isPlaced: false,
      rotation: 0,
    })
  }
  
  return pieces
}

export function isPieceInCorrectPosition(piece: PuzzlePiece, tolerance: number = 20): boolean {
  const distance = Math.sqrt(
    Math.pow(piece.currentX - piece.targetX, 2) + 
    Math.pow(piece.currentY - piece.targetY, 2)
  )
  return distance <= tolerance
}

export function calculatePuzzleProgress(pieces: PuzzlePiece[]): number {
  const placedPieces = pieces.filter(piece => piece.isPlaced).length
  return (placedPieces / pieces.length) * 100
}
