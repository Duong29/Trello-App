import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
  // closestCenter
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useEffect, useCallback, useRef } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}
function BoardContent({ board }) {
  // Nếu dùng PointerSensor mặc định thì phải kết hợp thuộc tính CSS touch-action: none ở những phần tử kéo thả - mà còn bug

  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt even, fix trường hợp click bị gọi event
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  // Ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, không bị bug
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })
  // Nhấn giữ 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 }
  })
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Cùng một thời điểm chỉ có một phần tử được kéo(column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  // Column cũ khi kéo Cards
  const [oldColumn, setOldColumn] = useState(null)

  // Điểm va chạm cuối cùng trước đó xử lý thuật toán phát hiện va chạm
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  // Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    /* Nên dùng column.card thay vì column.cardOrderIds bởi vì ở bước handleDragOver
    thì sẽ làm dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới*/
    return orderedColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(cardId)
    )
  }
  // Func chung xử lý việc cập nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau
  const moveCardBetweenDiffColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      // Tìm vị trí index của cái overCard trong column đích (nơi mà activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      )

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard)
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1
      // Clone mảng OrderedColumnsState cũ ra 1 cái mới để xử lý data rồi return - Cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      )
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      )

      // nextActiveColumn: Column cũ
      if (nextActiveColumn) {
        // Xoá card ở cái column active(column cũ)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )
        // Thêm Placeholder Card nếu column rỗng
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        )
      }
      // Đối với trường hợp DragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card
      // giữa 2 column khác nhau
      const rebuild_activeDraggingCardData = {
        ...activeDraggingCardData,
        columnId: nextOverColumn._id
      }
      // nextOverColumn: Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại ở overColum chưa, nếu có thì cần xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        )

        // Thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        )

        // Xóa Placeholder Card đi nếu đang tồn tại
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        )
      }
      console.log('nextColumns: ', nextColumns)
      // console.log('nextOverColumn: ', nextOverColumn)
      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo 1 phần tử
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
    // Nếu là kéo card thì mới thực hiện những hành động set giá trị oldColumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumn(findColumnByCardId(event?.active?.id))
    }
  }
  // Trigger trong quá trình kéo một phần tử
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    // Còn nếu kéo card thì xử lí thêm để có thể kéo card qua lại giữa các column
    // console.log('handleDragOver: ', event)
    const { active, over } = event

    // Cần đảm bảo nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    if (!active || !over) return

    // activeDraggingCardData là card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }
    } = active
    // overCard là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over

    // Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại 1 trong 2 column thì không làm gì, tránh crash trang web
    if (!activeColumn || !overColumn) return
    /*Xử lí logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính
      column ban đầu của nó thì không làm gì*/
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDiffColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }
  }
  // Trigger khi kết thúc 1 hành động kéo 1 phần tử
  const handleDragEnd = (event) => {
    const { active, over } = event
    // Xử lý kéo thả Cards
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      if (!active || !over) return

      // activeDraggingCardData là card đang được kéo
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData }
      } = active
      // overCard là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
      const { id: overCardId } = over

      // Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Nếu không tồn tại 1 trong 2 column thì không làm gì, tránh crash trang web
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả giữa 2 column
      if (oldColumn._id !== overColumn._id) {
        moveCardBetweenDiffColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // Hành động kéo thả card trong cùng 1 column

        // Lấy vị trí cũ từ oldColumn khi kéo card
        const oldCardIndex = oldColumn?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        )
        // Lấy vị trí mới từ over
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        )

        // Dùng arrayMove vì kéo card trong 1 cái column thì tương tự với logic kéo column trong 1 cái BoardContent
        const dndOrderedCards = arrayMove(
          oldColumn?.cards,
          oldCardIndex,
          newCardIndex
        )
        setOrderedColumns((prevColumns) => {
          // Clone mảng OrderedColumnsState cũ ra 1 cái mới để xử lý data rồi return - Cập nhật lại OrderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns)
          // Tìm tới cái column mà đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          )

          // Cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id)

          // Trả về vị trí state mới
          return nextColumns
        })
      }
    }

    // Xử lý kéo thả Columns
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // Lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(
          (c) => c._id === active.id
        )
        // Lấy vị trí mới từ over
        const newColumnIndex = orderedColumns.findIndex(
          (c) => c._id === over.id
        )
        // Dùng arrayMove của dndkit để sắp xếp lại mảng columns ban đầu
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        )
        const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
        // 2 console.log sau này dùng để xử lý gọi API
        // console.log('dndOrderedColumns: ', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds )

        // Cập nhật lại state columns ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    // Sau khi kéo thả xong thì set giá trị về ban đầu là null
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumn(null)
  }
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  }

  // Custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card giữa nhiều column
  // args = arguments = Các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)
    if (!pointerIntersections?.length) return

    // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    // const intersections = !!pointerIntersections?.length ? pointerIntersections : rectIntersection(args)

    // Tìm overId đầu tiên trong đám pointerIntersections đầu tiên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      const checkColumn = orderedColumns.find(column => column._id === overId)
      if (checkColumn) {
        // console.log('overId before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId after: ', overId)
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }
    // Nếu overId là null thì trả về mảng rỗng
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType])
  return (
    <DndContext
      // Cảm biến
      sensors={sensors}
      // Thuật toán phát hiện va chạm (k có nó thì card có cover lớn sẽ không kéo qua column được, vì đang conflict giữa card và column)
      // Dùng closestCorners thay vì closestCenter
      // *Update: Nếu chỉ dùng closestCorners sẽ có bug flickering + sai lệch dữ liệu
      // collisionDetection={closestCorners}

      // Custom nâng cao thuật toán phát hiện va chạm (fix bug)
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          display: 'flex',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={dropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
