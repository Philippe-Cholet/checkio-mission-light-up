"""
CheckiOReferee is a base referee for checking you code.
    arguments:
        tests -- the dict contains tests in the specific structure.
            You can find an example in tests.py.
        cover_code -- is a wrapper for the user function and additional operations before give data
            in the user function. You can use some predefined codes from checkio.referee.cover_codes
        checker -- is replacement for the default checking of an user function result. If given, then
            instead simple "==" will be using the checker function which return tuple with result
            (false or true) and some additional info (some message).
            You can use some predefined codes from checkio.referee.checkers
        add_allowed_modules -- additional module which will be allowed for your task.
        add_close_builtins -- some closed builtin words, as example, if you want, you can close "eval"
        remove_allowed_modules -- close standard library modules, as example "math"
checkio.referee.checkers
    checkers.float_comparison -- Checking function fabric for check result with float numbers.
        Syntax: checkers.float_comparison(digits) -- where "digits" is a quantity of significant
            digits after coma.
checkio.referee.cover_codes
    cover_codes.unwrap_args -- Your "input" from test can be given as a list. if you want unwrap this
        before user function calling, then using this function. For example: if your test's input
        is [2, 2] and you use this cover_code, then user function will be called as checkio(2, 2)
    cover_codes.unwrap_kwargs -- the same as unwrap_kwargs, but unwrap dict.
"""

from checkio import api
from checkio.signals import ON_CONNECT
from checkio.referees.io import CheckiOReferee
# from checkio.referees import cover_codes

from tests import TESTS


def checker(grid, result):
    *WALLS, LIGHT, LIT, DARK = '01234XL. '
    grid = list(map(list, grid))
    nb_rows, nb_cols = len(grid), len(grid[0])
    # Check types and transform result into a Set[Tuple[int]].
    user_lights = set()
    for elem in result:
        if not (isinstance(elem, (tuple, list)) and len(elem) == 2
                and all(isinstance(n, int) for n in elem)):
            return False, ("Your iterable result should contain "
                           "tuples/lists of 2 ints.", "Invalid")
        i, j = light = tuple(elem)
        if light in user_lights:  # Duplicates are not allowed.
            return False, ("You can't put two lights "
                           f"at the same place {light}.", "Invalid")
        if not (0 <= i < nb_rows and 0 <= j < nb_cols):
            return False, ("You can't put a light outside the grid "
                           f"like at {light}.", "Invalid")
        user_lights.add(light)
    # Check if the result respect numbers in the grid.
    digits = ((i, j, int(cell))
              for i, row in enumerate(grid)
              for j, cell in enumerate(row) if cell.isdigit())
    for i, j, nb_lights in digits:
        nb_user_lights = len({(i - 1, j), (i, j - 1),
                              (i + 1, j), (i, j + 1)} & user_lights)
        if nb_user_lights != nb_lights:
            return False, (f"The cell {(i, j)} should have {nb_lights} "
                           f"neighboring lights, not {nb_user_lights}.",
                           "Valid")
    # Put user lights on the grid, check if it's possible.
    for i, j in user_lights:
        if grid[i][j] == LIT:  # LIGHTS CONFLICT!
            return False, (f"Light at {(i, j)} is wrongly lit by another.",
                            "Valid")
        if grid[i][j] in WALLS:
            return False, (f"You can't put a light in the wall at {(i, j)}."
                            ,"Valid")
        grid[i][j] = LIGHT  # Put a light in DARKness.
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = i + di, j + dj
            while (0 <= ni < nb_rows and 0 <= nj < nb_cols
                   and grid[ni][nj] not in WALLS):
                grid[ni][nj] = LIT
                ni, nj = ni + di, nj + dj
    # Finally, check if the all grid is lit.
    nb_dark = sum(row.count(DARK) for row in grid)
    if nb_dark:
        return False, (f"There are still {nb_dark} cell(s) in the dark.",
                "Valid")
    return True, ("Great!", "Valid")


cover_iterable = '''
def cover(func, grid):
    return list(func(tuple(grid)))
'''

api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        checker=checker,
        function_name={
            'python': 'light_up',
            # 'js': 'lightUp'
            },
        cover_code={
            'python-3': cover_iterable,
            # 'js-node':
            }
        ).on_ready
    )
