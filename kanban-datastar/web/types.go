package web

type User struct {
	Id   string
	Name string
}

type BoardDetails struct {
	ID          string
	Title       string
	Description string
	Lists       []ListWithCards
}

type ListWithCards struct {
	ID       string
	Title    string
	Position int64
	Cards    []CardWithDetails
}

type CardWithDetails struct {
	ID           string
	Title        string
	Description  string
	AssigneeID   string
	AssigneeName string
	Position     int64
	Completed    bool
	Tags         []TagItem
	Comments     []CommentItem
}

type TagItem struct {
	ID    string
	Name  string
	Color string
}

type CommentItem struct {
	ID       string
	Text     string
	UserID   string
	UserName string
}
