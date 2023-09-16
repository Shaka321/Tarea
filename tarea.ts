//Tarea 1
class Book {
    constructor(public title: string, public author: string, public isLoaded: boolean = false, public isAvailable: string, public borrowedDate?: Date) { }
    // Requisito 1: Cada libro tiene un tiempo de préstamo estándar de 7 días.
    // El tiempo de préstamo estándar se establece en FineManager.
}

class User {
    static UserID: any;
    constructor(public UserID: string, public name: string) { }
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

class FineManager implements IFineManager {
    private standardLoanPeriodInDays: number = 7;
    private fineRatePerDay: number = 1;

    calculateFine(book: Book): number {
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
        if (book.isLoaded) {
            this.logger.log('Book is loaded');
            return;
        }
         // Requisito 2: Una vez que un libro se presta, se debe registrar la fecha de préstamo.
        book.borrowedDate = new Date(); // Registra la fecha de préstamo
        this.loadBooks.set(book.isAvailable, user);
        book.isLoaded = true;
        this.logger.log(`Información del usuario que está tomando prestado el libro:
        UserID: ${user.UserID}
        Nombre: ${user.name}`);
    }

    returnBook(book: Book): void {
        if (!book.isLoaded) {
            this.logger.log('Book is not loaded');
            return;
        }
        const user = this.loadBooks.get(book.isAvailable);
        if (user) {
            this.loadBooks.delete(book.isAvailable);
            book.isLoaded = false;
            this.logger.log(`Información del usuario que está devolviendo el libro:
            UserID: ${user.UserID}
            Nombre: ${user.name}`);

            // Requisito 3: Cuando un libro es devuelto, el sistema debe calcular si se ha pasado del tiempo estándar y, si es así, determinar cuántos días se ha pasado.
            // Requisito 4: Por cada día de retraso,
            // Calcular y registrar la multa
            const fine = this.fineManager.calculateFine(book);
            if (fine > 0) {
                this.logger.log(`Multa generada: $${fine}`);
            }
        } else {
            this.logger.log('No se encontró al usuario que está devolviendo el libro');
        }
    }

    addBook(book: Book) {
        this.logger.log('Inicio de operación');
        this.books.push(book);
        this.logger.log('Fin de operación');
    }

    validateBookTitle(book: Book, tituloL: string) {
        if (book.title !== tituloL) {
            this.logger.log('El libro no tiene el título correcto');
        } else {
            this.logger.log('El libro tiene el título correcto');
        }
    }

    findBookByTitle(title: string): Book | undefined {
        this.logger.log('Inicio de operación');
        const book = this.books.find(book => book.title === title);
        if (!book) {
            this.logger.log('No se encontró el libro');
        }
        return book;
    }
}