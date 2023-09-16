// Enumeración para los tipos de membresía
enum MembershipType {
    Basic = "Básico",
    Premium = "Premium",
    Platinum = "Platino",
}

class User {
    constructor(public UserID: string, public name: string, public membership: MembershipType) { }
}

enum BookCategory {
    Fiction = "Ficción",
    NonFiction = "No Ficción",
    Reference = "Referencia",
}

class Book {
    constructor(public title: string, public author: string, public category: BookCategory, public isAvailable: boolean = true) { }
}

interface ILoadManager {
    loadBook(book: Book, user: User): void;
    returnBook(book: Book): void;
}

interface ILogger {
    log(message: string): void;
}

interface IFineManager {
    calculateFine(book: Book): number;
}

interface IMembership {
    canBorrow(bookCount: number): boolean;
}

class Membership implements IMembership {
    constructor(private type: MembershipType) { }

    canBorrow(bookCount: number): boolean {
        switch (this.type) {
            case MembershipType.Basic:
                return bookCount <= 2;
            case MembershipType.Premium:
                return bookCount <= 5;
            case MembershipType.Platinum:
                return true; // Puede pedir prestado un número ilimitado de libros.
            default:
                return false;
        }
    }
}

class FineManager implements IFineManager {
    private standardLoanPeriodInDays: number = 7;
    private fineRatePerDay: number = 1;

    calculateFine(book: Book): number {
        if (book.isAvailable) {
            return 0; // No hay multa si el libro está disponible
        }

        const currentDate = new Date();
        const dueDate = new Date(book.borrowedDate);
        dueDate.setDate(dueDate.getDate() + this.standardLoanPeriodInDays);

        if (currentDate > dueDate) {
            const daysLate = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
            return daysLate * this.fineRatePerDay;
        }

        return 0;
    }
}

class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}

class Library implements ILoadManager {
    private books: Book[] = [];
    private loadBooks: Map<string, User> = new Map();
    private fineManager: IFineManager;

    constructor(private logger: ILogger, fineManager: IFineManager) {
        this.fineManager = fineManager;
    }

    loadBook(book: Book, user: User): void {
        if (book.isAvailable) {
            book.isAvailable = false; // Marcar el libro como prestado
            book.borrowedDate = new Date(); // Registrar la fecha de préstamo
            this.loadBooks.set(book.title, user);
            this.logger.log(`El usuario ${user.name} ha tomado prestado el libro: ${book.title}`);
        } else {
            this.logger.log('El libro no está disponible para préstamo en este momento.');
        }
    }

    returnBook(book: Book): void {
        if (!book.isAvailable) {
            book.isAvailable = true; // Marcar el libro como disponible
            const user = this.loadBooks.get(book.title);
            if (user) {
                this.loadBooks.delete(book.title);
                this.logger.log(`El usuario ${user.name} ha devuelto el libro: ${book.title}`);
                const fine = this.fineManager.calculateFine(book);
                if (fine > 0) {
                    this.logger.log(`Multa generada: $${fine}`);
                }
            }
        } else {
            this.logger.log('El libro ya está disponible en la biblioteca.');
        }
    }

    addBook(book: Book) {
        this.books.push(book);
        this.logger.log(`Se ha agregado el libro: ${book.title}`);
    }

    validateBookTitle(book: Book, title: string) {
        if (book.title !== title) {
            this.logger.log('El libro no tiene el título correcto');
        } else {
            this.logger.log('El libro tiene el título correcto');
        }
    }

    findBookByTitle(title: string): Book | undefined {
        const book = this.books.find(book => book.title === title);
        if (!book) {
            this.logger.log('No se encontró el libro');
        }
        return book;
    }
}

// Ejemplo de uso:
const logger = new ConsoleLogger();
const fineManager = new FineManager();
const library = new Library(logger, fineManager);

const book1 = new Book("El Gran Gatsby", "F. Scott Fitzgerald", BookCategory.Fiction);
const book2 = new Book("Sapiens", "Yuval Noah Harari", BookCategory.NonFiction);
const book3 = new Book("Enciclopedia", "Varios Autores", BookCategory.Reference);

library.addBook(book1);
library.addBook(book2);
library.addBook(book3);

const user1 = new User("1", "Usuario1", MembershipType.Basic);
const user2 = new User("2", "Usuario2", MembershipType.Premium);
const user3 = new User("3", "Usuario3", MembershipType.Platinum);

library.loadBook(book1, user1);
library.loadBook(book2, user2);
library.loadBook(book3, user3);

library.returnBook(book1);
library.returnBook(book2);
library.returnBook(book3);

// Ejemplo de verificación de membresía
console.log(`Usuario1 puede pedir prestados ${user1.membership} libros: ${user1.membership.canBorrow(3)}`);
console.log(`Usuario2 puede pedir prestados ${user2.membership} libros: ${user2.membership.canBorrow(6)}`);
console.log(`Usuario3 puede pedir prestados ${user3.membership} libros: ${user3.membership.canBorrow(10)}`);
