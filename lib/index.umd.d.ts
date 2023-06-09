import { Tags, GameComment, PgnMove, MessagesObject } from '@mliebelt/pgn-types';

type StartRule = 'pgn' | 'game' | 'tags' | 'games';
type PgnOptions = {
    startRule: StartRule;
    fen?: string;
};
type ParseTree = {
    tags?: Tags;
    gameComment?: GameComment;
    moves: PgnMove[];
} & MessagesObject;

type SyntaxError = {expected: string, found: string, location: number }

/**
 * General parse function, that accepts all `startRule`s. Calls then the more specific ones, so that the
 * postParse processing can now rely on the same structure all the time.
 * @param input - the PGN string that will be parsed according to the `startRule` given
 * @param options - the parameters that have to include the `startRule`
 * @returns a ParseTree or an array of ParseTrees, depending on the startRule
 */
declare function parse(input: string, options: PgnOptions): ParseTree | ParseTree[] | PgnMove[] | Tags;
/**
 * Special parse function to parse one game only, options may be omitted.
 * @param input - the PGN string that will be parsed
 * @param options - object with additional parameters (not used at the moment)
 * @returns a ParseTree with the defined structure
 */
declare function parseGame(input: string, options?: PgnOptions): ParseTree;
/**
 * Parses possibly more than one game, therefore returns an array of ParseTree.
 * @param input the PGN string to parse
 * @param options the optional parameters (not used at the moment)
 * @returns an array of ParseTrees, one for each game included
 */
declare function parseGames(input: any, options?: PgnOptions): ParseTree[];

type TagString = string;
type PgnString = string;
type SplitGame = {
    tags: TagString;
    pgn: PgnString;
    all: string;
};

/**
 * Returns an array of SplitGames, which are objects that may contain tags and / or pgn strings.
 * @param input - the PGN string that may contain multiple games
 * @param options - not used at the moment
 * @returns an array of SplitGame to be parsed later
 */
declare function split(input: string, options?: PgnOptions): SplitGame[];

export { ParseTree, PgnOptions, SplitGame, StartRule, SyntaxError, parse, parseGame, parseGames, split };
