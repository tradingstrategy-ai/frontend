<script>
  import Highlight from "svelte-highlight";
  import python from "svelte-highlight/src/languages/python";
  import github from "svelte-highlight/src/styles/github";

  const code = `# Modified double 7 for
import pandas as pd
from tradingstrategy.timebucket import TimeBucket
from tradingstrategy.chain import ChainId
from tradingstrategy.analysis.tradehint import TradeHint, TradeHintType
from tradingstrategy.frameworks.backtrader import DEXStrategy

# Which pair we trade
TARGET_PAIR = ("WETH", "USDC")

# The backtest only consider Ethereum mainnet
BLOCKCHAIN = ChainId.ethereum

# The backtest only considers Sushiswap v2 exchange
EXCHANGE = "sushiswap"

# Use 4h candles for backtesting
CANDLE_KIND = TimeBucket.h1

# How many USD is our play money wallet
INITIAL_CASH = 10_000

# The moving average must be above of this number for us to buy
MOVING_AVERAGE_CANDLES = 40

# How many previous candles we sample for the low close value
LOW_CANDLES = 5

# How many previous candles we sample for the high close value
HIGH_CANDLES = 5

# When do we start the backtesting - limit the candle set from the data dump from the server
BACKTESTING_BEGINS = pd.Timestamp("2021-1-1")

# When do we end backtesting
BACKTESTING_ENDS = pd.Timestamp("2021-10-1")

# If the price drops 15% we trigger a stop loss
STOP_LOSS = 0.95



#: Per day interest rates for the hackathon submission
daily_interest_rates = {}


class Double7(DEXStrategy):
    """An example of double-77 strategy for DEX spot trading.

    The original description: https://www.thechartist.com.au/double-7-s-strategy/
    """

    def start(self):
        # Set up indicators used in this strategy

        # Moving average that tells us when we are in the bull market
        self.moving_average = indicators.SMA(period=MOVING_AVERAGE_CANDLES)

        # The highest close price for the N candles
        # "exit" in pine script
        self.highest = indicators.Highest(self.data.close, period=HIGH_CANDLES, plot=True, subplot=False)

        # The lowest close price for the N candles
        # "entry" in pine script
        self.lowest = indicators.Lowest(self.data.close, period=LOW_CANDLES, plot=True, subplot=False)

        self.interest_accured = {}

    def get_interest_rate(self, dt):
        """Get interest rate per tick for TheGraph Aave historical rates

        See Github for the full implementation.
        """
        dt = num2date(dt)
        d = dt.date()
        dt2 = datetime.datetime.combine(d, datetime.datetime.min.time())
        rate = daily_interest_rates[dt2]
        return (rate / 365) / 24

    def get_interest_accured(self):
        """All interested gained over the strategy"""
        return sum(self.interest_accured.values())

    def next(self):
        """Execute a decision making tick for each candle."""
        close = self.data.close[0]
        low = self.lowest[-1]
        high = self.highest[-1]
        avg = self.moving_average[0]

        if not all([close, low, high, avg]):
            # Do not try to make any decision if we have nan or zero data
            return

        position: Optional[Position] = self.position

        if not position:
            # We are not in the markets, check entry
            if close >= avg and close <= low and not position:
                # Enter when we are above moving average and the daily close was
                self.buy(price=close, hint=TradeHint(type=TradeHintType.open))

            # Accumulate Aave interest
            dt = self.datetime[0]
            self.interest_accured[dt] = self.broker.get_cash() * self.get_interest_rate(dt)
        else:
            # We are in the markets, check exit
            if close >= high:
                # If the price closes above its 7 day high, exit from the markets
                self.close(hint=TradeHint(type=TradeHintType.close))
            else:
                # Check the exit from the market through stop loss

                # Because AMMs do not support complex order types,
                # only swaps, we do not manual stop loss here by
                # brute market sell in the case the price falls below the stop loss threshold

                entry_price = self.last_opened_buy.price
                if close <= entry_price * STOP_LOSS:
                    self.close(hint=TradeHint(type=TradeHintType.stop_loss_triggered))



  `
</script>

<svelte:head>
  {@html github}
</svelte:head>

<div class="row">
  <div class="col-md-12">
    <Highlight language={python} {code} />
  </div>
</div>
