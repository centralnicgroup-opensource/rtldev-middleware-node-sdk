export class ResponseIterator {
    public rows: any[];
    public index: number = 0;

    constructor(rows: any[]) {
      this.rows = rows;
    }

    public hasPrevious(): boolean {
      return (this.index > 0);
    }

    public previous(): any {
      return (this.hasPrevious() ? this.rows[--this.index] : null);
    }

    public next(): any {
      return (this.hasNext() ? this.rows[++this.index] : null);
    }

    public hasNext(): boolean {
      return (this.index < (this.rows.length - 1));
    }

    public rewind(): any {
      this.index = 0;
      return this.current();
    }

    public current(): any {
      return this.rows[this.index];
    }
  }
