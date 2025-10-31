package web

type User struct {
	Id   string
	Name string
}

type Board struct {
	ID          string
	Title       string
	Description string
	Lists       []ListWithCards
}

type ListWithCards struct {
	ID       string
	Title    string
	Position int64
	Cards    []Card
}

type Card struct {
	ID           string
	Title        string
	Description  string
	AssigneeID   string
	AssigneeName string
	Position     int64
	Completed    bool
	Tags         []Tag
	Comments     []Comment
}

type Tag struct {
	ID    string
	Name  string
	Color string
}

type Comment struct {
	ID       string
	Text     string
	UserID   string
	UserName string
}
