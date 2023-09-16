// Definición de la clase Book para representar libros en la biblioteca
class Book {
    constructor(public title: string, public author: string, public category: BookCategory, public isAvailable: boolean = true) { }
}

// Interfaz que define las operaciones de carga y devolución de libros
interface ILoadManager {
    loadBook(book: Book, user: User): void;
    returnBook(book: Book): void;
}

// Interfaz para registrar mensajes o eventos
interface ILogger {
    log(message: string): void;
}

// Interfaz para calcular multas por retraso en la devolución de libros
interface IFineManager {
    calculateFine(book: Book): number;
}

// Interfaz que define las reglas de membresía
interface IMembership {
    canBorrow(bookCount: number): boolean;
}

// Clase Membership implementa IMembership y define las reglas de membresía
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

// Clase FineManager implementa IFineManager y calcula multas por retraso en la devolución de libros
class FineManager implements IFineManager {
    private standardLoanPeriodInDays: number = 7; // Período estándar de préstamo en días
    private fineRatePerDay: number = 1; // Tasa de multa por día de retraso

    calculateFine(book: Book): number {
        if (book.isAvailable) {
            return 0; // No hay multa si el libro está disponible
        }

        const currentDate = new Date();
        const dueDate = new Date(book.borrowedDate);
        dueDate.setDate(dueDate.getDate() + this.standardLoanPeriodInDays);

        if (currentDate > dueDate) {
            const daysLate = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24)); // Calcular días de retraso
            return daysLate * this.fineRatePerDay; // Calcular multa
        }

        return 0; // No hay multa si se devuelve a tiempo
    }
}

// Clase ConsoleLogger implementa ILogger para registrar mensajes en la consola
class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}

// Clase Library implementa ILoadManager y gestiona la biblioteca
class Library implements ILoadManager {
    private books: Book[] = []; // Lista de libros en la biblioteca
    private loadBooks: Map<string, User> = new Map(); // Mapa de libros cargados por usuarios
    private fineManager: IFineManager; // Objeto para calcular multas

    constructor(private logger: ILogger, fineManager: IFineManager) {
        this.fineManager = fineManager;
    }

    // Método para cargar un libro a un usuario
    loadBook(book: Book, user: User): void {
        if (book.isAvailable) {
            book.isAvailable = false; // Marcar el libro como prestado
            book.borrowedDate = new Date(); // Registrar la fecha de préstamo
            this.loadBooks.set(book.title, user); // Registrar el préstamo
            
            // Registrar el préstamo en el historial del usuario
            user.loanHistory.push({ bookTitle: book.title, borrowedDate: book.borrowedDate, returnedDate: null });

            this.logger.log(`El usuario ${user.name} ha tomado prestado el libro: ${book.title}`);
        } else {
            this.logger.log('El libro no está disponible para préstamo en este momento.');
        }
    }

    // Método para devolver un libro a la biblioteca
    returnBook(book: Book): void {
        if (!book.isAvailable) {
            book.isAvailable = true; // Marcar el libro como disponible
            const user = this.loadBooks.get(book.title);
            if (user) {
                this.loadBooks.delete(book.title); // Eliminar el préstamo registrado
                const returnedDate = new Date(); // Obtener la fecha de devolución
                const loan = user.loanHistory.find(loan => loan.bookTitle === book.title && loan.returnedDate === null);
                if (loan) {
                    loan.returnedDate = returnedDate; // Actualizar la fecha de devolución en el historial
                }
                this.logger.log(`El usuario ${user.name} ha devuelto el libro: ${book.title}`);
                const fine = this.fineManager.calculateFine(book); // Calcular multa por retraso
                if (fine > 0) {
                    this.logger.log(`Multa generada: $${fine}`);
                }
            }
        } else {
            this.logger.log('El libro ya está disponible en la biblioteca.');
        }
    }

    // Método para agregar un libro a la biblioteca
    addBook(book: Book) {
        this.books.push(book);
        this.logger.log(`Se ha agregado el libro: ${book.title}`);
    }

    // Método para validar el título de un libro
    validateBookTitle(book: Book, title: string) {
        if (book.title !== title) {
            this.logger.log('El libro no tiene el título correcto');
        } else {
            this.logger.log('El libro tiene el título correcto');
        }
    }

    // Método para buscar un libro por título
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

// Ejemplo de acceso al historial de préstamos de un usuario
console.log(`Historial de préstamos de ${user1.name}:`);
user1.loanHistory.forEach(loan => {
    console.log(`Libro: ${loan.bookTitle}, Fecha de préstamo: ${loan.borrowedDate}, Fecha de devolución: ${loan.returnedDate}`);
});
