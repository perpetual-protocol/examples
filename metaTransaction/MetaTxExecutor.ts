import { Contract, providers } from "ethers"
import { MetaTxWrapper } from "src/common/metaTx/MetaTxWrapper"
import { Dir } from "src/constant"
import { MetaTxGateway } from "src/types/contracts"
import { Decimal } from "../../common/utils"
import { ClearingHouseActions } from "./types"

export class MetaTxExecutor extends MetaTxWrapper implements ClearingHouseActions {
    constructor(
        biconomyApiKey: string,
        biconomyGatewayApiId: string,
        biconomyTokenApiId: string,
        layer1Provider: providers.Web3Provider | providers.BaseProvider,
        layer2Provider: providers.BaseProvider,
        contract: Contract,
        supportMetaTx = true,
        metaTxGateway?: MetaTxGateway,
        account?: string | null,
    ) {
        super(
            biconomyApiKey,
            biconomyGatewayApiId,
            biconomyTokenApiId,
            layer1Provider,
            layer2Provider,
            contract,
            supportMetaTx,
            metaTxGateway,
            account,
        )
    }
    addMargin(ammAddress: string, increaseMargin: Decimal): Promise<string> {
        return this.sendTxToFunction("addMargin", [ammAddress, increaseMargin])
    }
    removeMargin(ammAddress: string, decreaseMargin: Decimal): Promise<string> {
        return this.sendTxToFunction("removeMargin", [ammAddress, decreaseMargin])
    }
    openPosition(
        ammAddress: string,
        dir: Dir,
        quoteAssetAmount: Decimal,
        leverage: Decimal,
        minBaseAssetAmount: Decimal,
    ): Promise<string> {
        return this.sendTxToFunction("openPosition", [ammAddress, dir, quoteAssetAmount, leverage, minBaseAssetAmount])
    }
    closePosition(ammAddress: string, quoteAssetAmountLimit: Decimal): Promise<string> {
        return this.sendTxToFunction("closePosition", [ammAddress, quoteAssetAmountLimit])
    }
    adjustPosition(ammAddress: string): Promise<string> {
        return this.sendTxToFunction("adjustPosition", [ammAddress])
    }
}
